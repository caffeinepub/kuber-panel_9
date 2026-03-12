import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type FundType = {
    #gaming;
    #stock;
    #mix;
    #political;
  };

  public type AccountStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type CommissionMethod = {
    #upi;
    #bankTransfer;
    #usdt;
  };

  public type CommissionStatus = {
    #pending;
    #approved;
  };

  public type BankAccount = {
    accountType : Text;
    bankName : Text;
    accountHolder : Text;
    accountNumber : Text;
    ifscCode : Text;
    mobileNumber : Text;
    upiId : Text;
    status : AccountStatus;
  };

  public type FundToggle = {
    fundType : FundType;
    isActive : Bool;
  };

  public type TransactionType = {
    #credit;
    #debit;
  };

  public type Transaction = {
    transactionId : Text;
    userId : Text;
    fundType : FundType;
    amount : Nat;
    transactionType : TransactionType;
    datetime : Time.Time;
  };

  public type CommissionHistory = {
    fundType : FundType;
    amount : Nat;
    timestamp : Time.Time;
  };

  public type FundActivation = {
    code : Text;
    fundType : FundType;
    isUsed : Bool;
    usedByUserId : ?Text;
    createdAt : Time.Time;
  };

  public type CommissionWithdrawal = {
    id : Text;
    method : CommissionMethod;
    amount : Nat;
    userId : Text;
    status : CommissionStatus;
    createdAt : Time.Time;
    approvedAt : ?Time.Time;
  };

  public type UserProfile = {
    userId : Text;
    email : Text;
    passwordHash : Text;
    isActive : Bool;
    registeredAt : Time.Time;
    activatedFunds : [FundToggle];
    banks : [BankAccount];
    commissionBalance : Nat;
    commissionHistory : [CommissionHistory];
    withdrawalRequests : [CommissionWithdrawal];
  };

  // Simple cross-device user/code types (no Principal auth)
  public type SimpleUser = {
    email : Text;
    passwordHash : Text;
    activatedFunds : [Text];
    registeredAt : Time.Time;
  };

  public type SimpleCode = {
    code : Text;
    fundType : Text;
    isUsed : Bool;
    usedBy : Text;
    createdAt : Time.Time;
  };

  module UserProfile {
    public func compareByEmail(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.email, profile2.email);
    };
  };

  let supportLink = Map.empty<Text, Text>();
  let activationCodes = Map.empty<Text, FundActivation>();
  let transactions = Map.empty<Text, Transaction>();
  let users = Map.empty<Text, UserProfile>();
  let principalToUserId = Map.empty<Principal, Text>();

  // Simple cross-device stores
  let simpleUsers = Map.empty<Text, SimpleUser>();
  let simpleCodes = Map.empty<Text, SimpleCode>();

  var nextUserId = 1;
  var nextWithdrawalId = 1;

  // --- Simple public auth (no Principal required) ---

  // Register by email -- returns "ok", "exists", or "admin_reserved"
  public func simpleRegister(email : Text, passwordHash : Text) : async Text {
    let lEmail = email.toLower();
    if (lEmail == "kuberpanelwork@gmail.com") {
      return "admin_reserved";
    };
    switch (simpleUsers.get(lEmail)) {
      case (?_) { "exists" };
      case (null) {
        simpleUsers.add(
          lEmail,
          {
            email = lEmail;
            passwordHash;
            activatedFunds = [];
            registeredAt = Time.now();
          },
        );
        "ok";
      };
    };
  };

  // Login -- returns true if credentials match
  public query func simpleLogin(email : Text, passwordHash : Text) : async Bool {
    let lEmail = email.toLower();
    switch (simpleUsers.get(lEmail)) {
      case (?user) { user.passwordHash == passwordHash };
      case (null) { false };
    };
  };

  // Admin saves activation code
  public func adminSaveActivationCode(adminPassHash : Text, code : Text, fundType : Text) : async Bool {
    if (adminPassHash != "QWRtaW5AMTIz") { return false };
    switch (simpleCodes.get(code)) {
      case (?_) { false };
      case (null) {
        simpleCodes.add(
          code,
          {
            code;
            fundType;
            isUsed = false;
            usedBy = "";
            createdAt = Time.now();
          },
        );
        true;
      };
    };
  };

  // Admin gets all activation codes
  public query func adminGetActivationCodes(adminPassHash : Text) : async [SimpleCode] {
    if (adminPassHash != "QWRtaW5AMTIz") { return [] };
    simpleCodes.values().toArray();
  };

  // Admin deletes activation code
  public func adminDeleteActivationCode(adminPassHash : Text, code : Text) : async Bool {
    if (adminPassHash != "QWRtaW5AMTIz") { return false };
    simpleCodes.remove(code);
    true;
  };

  // Admin gets all registered simple users
  public query func adminGetAllSimpleUsers(adminPassHash : Text) : async [SimpleUser] {
    if (adminPassHash != "QWRtaW5AMTIz") { return [] };
    simpleUsers.values().toArray();
  };

  // User applies activation code
  // Returns: "ok:fundType", "used", "invalid", "user_not_found"
  public func simpleUseCode(email : Text, code : Text) : async Text {
    let lEmail = email.toLower();
    switch (simpleCodes.get(code)) {
      case (?activation) {
        if (activation.isUsed) { return "used" };
        simpleCodes.add(code, { activation with isUsed = true; usedBy = lEmail });
        let fundType = activation.fundType;
        switch (simpleUsers.get(lEmail)) {
          case (?user) {
            let newFunds : [Text] = if (fundType == "all") {
              ["gaming", "stock", "mix", "political"];
            } else {
              // Use a simple for loop -- Iter does not have .size()
              var alreadyHas = false;
              for (f in user.activatedFunds.vals()) {
                if (f == fundType) { alreadyHas := true };
              };
              if (alreadyHas) {
                user.activatedFunds;
              } else {
                user.activatedFunds.concat([fundType]);
              };
            };
            simpleUsers.add(lEmail, { user with activatedFunds = newFunds });
            "ok:" # fundType;
          };
          case (null) { "user_not_found" };
        };
      };
      case (null) { "invalid" };
    };
  };

  // Get user's activated funds
  public query func getSimpleActivatedFunds(email : Text) : async [Text] {
    let lEmail = email.toLower();
    switch (simpleUsers.get(lEmail)) {
      case (?user) { user.activatedFunds };
      case (null) { [] };
    };
  };

  // --- Principal-based functions (existing) ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (principalToUserId.get(caller)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(userPrincipal : Principal) : async ?UserProfile {
    if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (principalToUserId.get(userPrincipal)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (principalToUserId.get(caller)) {
      case (?userId) {
        if (userId != profile.userId) {
          Runtime.trap("Unauthorized: Cannot modify another user's profile");
        };
        users.add(userId, profile);
      };
      case (null) {
        Runtime.trap("User not found");
      };
    };
  };

  public shared ({ caller }) func register(email : Text, passwordHash : Text) : async Bool {
    let isAdminEmail = email == "Kuberpanelwork@gmail.com";
    let userId = nextUserId.toText();
    nextUserId += 1;
    let initialFunds = [
      { fundType = #gaming; isActive = false },
      { fundType = #stock; isActive = false },
      { fundType = #mix; isActive = false },
      { fundType = #political; isActive = false },
    ];
    let user : UserProfile = {
      userId;
      email;
      passwordHash;
      isActive = false;
      registeredAt = Time.now();
      activatedFunds = initialFunds;
      banks = [];
      commissionBalance = 0;
      commissionHistory = [];
      withdrawalRequests = [];
    };
    users.add(userId, user);
    principalToUserId.add(caller, userId);
    if (isAdminEmail) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };
    true;
  };

  public shared ({ caller }) func addBankAccount(userId : Text, account : BankAccount) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bank accounts");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized: Can only add bank accounts to your own profile");
        };
        switch (users.get(userId)) {
          case (?user) {
            let updatedAccount = { account with status = #pending };
            let updatedBanks = user.banks.concat([updatedAccount]);
            let updatedUser = { user with banks = updatedBanks };
            users.add(userId, updatedUser);
          };
          case (null) { Runtime.trap("User not found") };
        };
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public shared ({ caller }) func updateBankAccountStatus(userId : Text, accountIndex : Nat, status : AccountStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve/reject bank accounts");
    };
    switch (users.get(userId)) {
      case (?user) {
        if (accountIndex >= user.banks.size()) {
          Runtime.trap("Invalid account index");
        };
        let banks = Array.tabulate(
          user.banks.size(),
          func(index) {
            if (index == accountIndex) {
              { user.banks[index] with status };
            } else {
              user.banks[index];
            };
          },
        );
        let updatedUser = { user with banks };
        users.add(userId, updatedUser);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func activateFund(userId : Text, fundType : FundType) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can activate funds");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized: Can only activate your own funds");
        };
        switch (users.get(userId)) {
          case (?user) {
            let hasApprovedBank = user.banks.find(func(b) { b.status == #approved });
            switch (hasApprovedBank) {
              case (null) { Runtime.trap("Cannot activate fund: No approved bank account") };
              case (?_) {
                let updatedFunds = Array.tabulate(
                  user.activatedFunds.size(),
                  func(index) {
                    let f = user.activatedFunds[index];
                    if (f.fundType == fundType) { { fundType = f.fundType; isActive = true } } else { f };
                  },
                );
                let updatedUser = { user with activatedFunds = updatedFunds };
                users.add(userId, updatedUser);
                true;
              };
            };
          };
          case (null) { false };
        };
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public shared ({ caller }) func deactivateFund(userId : Text, fundType : FundType) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deactivate funds");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized: Can only deactivate your own funds");
        };
        switch (users.get(userId)) {
          case (?user) {
            let updatedFunds = Array.tabulate(
              user.activatedFunds.size(),
              func(index) {
                let f = user.activatedFunds[index];
                if (f.fundType == fundType) { { fundType = f.fundType; isActive = false } } else { f };
              },
            );
            let updatedUser = { user with activatedFunds = updatedFunds };
            users.add(userId, updatedUser);
            true;
          };
          case (null) { false };
        };
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public shared ({ caller }) func addTransaction(transactionId : Text, userId : Text, fundType : FundType, amount : Nat, transactionType : TransactionType) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized: Can only add transactions to your own account");
        };
        let transaction : Transaction = { transactionId; userId; fundType; amount; transactionType; datetime = Time.now() };
        transactions.add(transactionId, transaction);
        true;
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public query ({ caller }) func getTransactions(userId : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (principalToUserId.get(caller)) {
        case (?callerUserId) {
          if (callerUserId != userId) { Runtime.trap("Unauthorized: Can only view your own transactions") };
        };
        case (null) { Runtime.trap("Caller not registered") };
      };
    };
    transactions.values().toArray().filter<Transaction>(func(t) { t.userId == userId });
  };

  public shared ({ caller }) func addCommissionEntry(userId : Text, fundType : FundType, amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add commission entries");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) { Runtime.trap("Unauthorized: Can only add commission to your own account") };
        switch (users.get(userId)) {
          case (?user) {
            let commissionEntry : CommissionHistory = { fundType; amount; timestamp = Time.now() };
            let updatedHistory = user.commissionHistory.concat([commissionEntry]);
            let updatedUser : UserProfile = { user with commissionHistory = updatedHistory; commissionBalance = user.commissionBalance + amount };
            users.add(userId, updatedUser);
            true;
          };
          case (null) { false };
        };
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public shared ({ caller }) func requestWithdrawal(userId : Text, method : CommissionMethod, amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) { Runtime.trap("Unauthorized: Can only request withdrawals from your own account") };
        switch (users.get(userId)) {
          case (?user) {
            if (user.commissionBalance < amount) { Runtime.trap("Insufficient commission balance") };
            let withdrawal : CommissionWithdrawal = { id = nextWithdrawalId.toText(); method; amount; userId; status = #pending; createdAt = Time.now(); approvedAt = null };
            nextWithdrawalId += 1;
            let updatedRequests = user.withdrawalRequests.concat([withdrawal]);
            let updatedUser = { user with withdrawalRequests = updatedRequests };
            users.add(userId, updatedUser);
            true;
          };
          case (null) { false };
        };
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public shared ({ caller }) func approveWithdrawal(userId : Text, withdrawalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };
    switch (users.get(userId)) {
      case (?user) {
        let requests = Array.tabulate(
          user.withdrawalRequests.size(),
          func(index) {
            let withdrawal = user.withdrawalRequests[index];
            if (withdrawal.id == withdrawalId) { { withdrawal with status = #approved; approvedAt = ?Time.now() } } else { withdrawal };
          },
        );
        let updatedUser = { user with withdrawalRequests = requests };
        users.add(userId, updatedUser);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func addSupportLink(key : Text, link : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update support link");
    };
    supportLink.add(key, link);
  };

  public query ({ caller }) func getSupportLink(key : Text) : async ?Text {
    supportLink.get(key);
  };

  public query ({ caller }) func getCurrentUser(userId : Text) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user profiles");
    };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (principalToUserId.get(caller)) {
        case (?callerUserId) {
          if (callerUserId != userId) { Runtime.trap("Unauthorized: Can only view your own profile") };
        };
        case (null) { Runtime.trap("Caller not registered") };
      };
    };
    users.get(userId);
  };

  public query ({ caller }) func getNonAdminUser(userId : Text) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users");
    };
    users.get(userId);
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func deleteUser(userId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    users.remove(userId);
  };

  public shared ({ caller }) func activateFundsBatch(codes : [(Text, FundActivation)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate activation codes");
    };
    for ((code, activation) in codes.vals()) {
      activationCodes.add(code, activation);
    };
  };

  public query ({ caller }) func getFundActivationCodes() : async [FundActivation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view activation codes");
    };
    activationCodes.values().toArray();
  };

  public shared ({ caller }) func useActivationCode(code : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use activation codes");
    };
    switch (principalToUserId.get(caller)) {
      case (?userId) {
        switch (activationCodes.get(code)) {
          case (?activation) {
            if (activation.isUsed) { Runtime.trap("Activation code already used") };
            let updatedActivation = { activation with isUsed = true; usedByUserId = ?userId };
            activationCodes.add(code, updatedActivation);
            switch (users.get(userId)) {
              case (?user) {
                let updatedFunds = Array.tabulate(
                  user.activatedFunds.size(),
                  func(index) {
                    let f = user.activatedFunds[index];
                    if (f.fundType == activation.fundType) { { fundType = f.fundType; isActive = true } } else { f };
                  },
                );
                let updatedUser = { user with activatedFunds = updatedFunds };
                users.add(userId, updatedUser);
                true;
              };
              case (null) { false };
            };
          };
          case (null) { Runtime.trap("Invalid activation code") };
        };
      };
      case (null) { Runtime.trap("Caller not registered") };
    };
  };

  public shared ({ caller }) func addBankAccountWithFunds(userId : Text, account : BankAccount, selectedFunds : [FundType], isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add bank accounts with funds");
    };
    switch (users.get(userId)) {
      case (?user) {
        let updatedAccount = { account with status = if isActive { #approved } else { #pending } };
        let activeFunds = selectedFunds.map(func(f) { { fundType = f; isActive = isActive } });
        let updatedBanks = user.banks.concat([updatedAccount]);
        let updatedFunds = user.activatedFunds.concat(activeFunds);
        let updatedUser = { user with banks = updatedBanks; activatedFunds = updatedFunds };
        users.add(userId, updatedUser);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func showToast(_message : Text) : async () {};
};
