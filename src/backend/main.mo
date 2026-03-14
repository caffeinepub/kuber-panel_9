import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
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

  let supportLink = Map.empty<Text, Text>();
  let activationCodes = Map.empty<Text, FundActivation>();
  let transactions = Map.empty<Text, Transaction>();
  let users = Map.empty<Text, UserProfile>();
  let principalToUserId = Map.empty<Principal, Text>();
  let simpleUsers = Map.empty<Text, SimpleUser>();
  let simpleCodes = Map.empty<Text, SimpleCode>();

  var nextUserId : Nat = 1;
  var nextWithdrawalId : Nat = 1;

  // Helper: append one item to an array
  func appendOne<T>(arr : [T], item : T) : [T] {
    Array.tabulate(arr.size() + 1, func(i : Nat) : T {
      if (i < arr.size()) arr[i] else item
    });
  };

  // --- Simple public auth (no Principal required) ---

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

  public query func simpleLogin(email : Text, passwordHash : Text) : async Bool {
    let lEmail = email.toLower();
    switch (simpleUsers.get(lEmail)) {
      case (?user) { user.passwordHash == passwordHash };
      case (null) { false };
    };
  };

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

  public query func adminGetActivationCodes(adminPassHash : Text) : async [SimpleCode] {
    if (adminPassHash != "QWRtaW5AMTIz") { return [] };
    simpleCodes.values().toArray();
  };

  public func adminDeleteActivationCode(adminPassHash : Text, code : Text) : async Bool {
    if (adminPassHash != "QWRtaW5AMTIz") { return false };
    simpleCodes.remove(code);
    true;
  };

  public query func adminGetAllSimpleUsers(adminPassHash : Text) : async [SimpleUser] {
    if (adminPassHash != "QWRtaW5AMTIz") { return [] };
    simpleUsers.values().toArray();
  };

  public func simpleUseCode(email : Text, code : Text) : async Text {
    let lEmail = email.toLower();
    switch (simpleCodes.get(code)) {
      case (?activation) {
        if (activation.isUsed) { return "used" };
        simpleCodes.remove(code);
        simpleCodes.add(code, { activation with isUsed = true; usedBy = lEmail });
        let fundType = activation.fundType;
        switch (simpleUsers.get(lEmail)) {
          case (?user) {
            let newFunds : [Text] = if (fundType == "all") {
              ["gaming", "stock", "mix", "political"];
            } else {
              var alreadyHas = false;
              for (f in user.activatedFunds.vals()) {
                if (f == fundType) { alreadyHas := true };
              };
              if (alreadyHas) {
                user.activatedFunds;
              } else {
                appendOne(user.activatedFunds, fundType);
              };
            };
            simpleUsers.remove(lEmail);
            simpleUsers.add(lEmail, { user with activatedFunds = newFunds });
            "ok:" # fundType;
          };
          case (null) { "user_not_found" };
        };
      };
      case (null) { "invalid" };
    };
  };

  public query func getSimpleActivatedFunds(email : Text) : async [Text] {
    let lEmail = email.toLower();
    switch (simpleUsers.get(lEmail)) {
      case (?user) { user.activatedFunds };
      case (null) { [] };
    };
  };

  // --- Principal-based functions ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(userPrincipal : Principal) : async ?UserProfile {
    if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(userPrincipal)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?userId) {
        if (userId != profile.userId) {
          Runtime.trap("Unauthorized");
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
    let initialFunds : [FundToggle] = [
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
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized");
        };
        switch (users.get(userId)) {
          case (?user) {
            let updatedAccount = { account with status = #pending };
            let updatedBanks = appendOne(user.banks, updatedAccount);
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
      Runtime.trap("Unauthorized");
    };
    switch (users.get(userId)) {
      case (?user) {
        if (accountIndex >= user.banks.size()) {
          Runtime.trap("Invalid account index");
        };
        let banks = Array.tabulate(
          user.banks.size(),
          func(index : Nat) : BankAccount {
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
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized");
        };
        switch (users.get(userId)) {
          case (?user) {
            var hasApprovedBank = false;
            for (b in user.banks.vals()) {
              if (b.status == #approved) { hasApprovedBank := true };
            };
            if (not hasApprovedBank) {
              Runtime.trap("Cannot activate fund: No approved bank account");
            };
            let updatedFunds = Array.tabulate(
              user.activatedFunds.size(),
              func(index : Nat) : FundToggle {
                let f = user.activatedFunds[index];
                if (f.fundType == fundType) { { fundType = f.fundType; isActive = true } } else { f };
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

  public shared ({ caller }) func deactivateFund(userId : Text, fundType : FundType) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized");
        };
        switch (users.get(userId)) {
          case (?user) {
            let updatedFunds = Array.tabulate(
              user.activatedFunds.size(),
              func(index : Nat) : FundToggle {
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
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized");
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
      Runtime.trap("Unauthorized");
    };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (principalToUserId.get(caller)) {
        case (?callerUserId) {
          if (callerUserId != userId) { Runtime.trap("Unauthorized") };
        };
        case (null) { Runtime.trap("Caller not registered") };
      };
    };
    let all = transactions.values().toArray();
    all.filter(func(t : Transaction) : Bool { t.userId == userId });
  };

  public shared ({ caller }) func addCommissionEntry(userId : Text, fundType : FundType, amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) { Runtime.trap("Unauthorized") };
        switch (users.get(userId)) {
          case (?user) {
            let commissionEntry : CommissionHistory = { fundType; amount; timestamp = Time.now() };
            let updatedHistory = appendOne(user.commissionHistory, commissionEntry);
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
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) { Runtime.trap("Unauthorized") };
        switch (users.get(userId)) {
          case (?user) {
            if (user.commissionBalance < amount) { Runtime.trap("Insufficient commission balance") };
            let withdrawal : CommissionWithdrawal = {
              id = nextWithdrawalId.toText();
              method;
              amount;
              userId;
              status = #pending;
              createdAt = Time.now();
              approvedAt = null;
            };
            nextWithdrawalId += 1;
            let updatedRequests = appendOne(user.withdrawalRequests, withdrawal);
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
      Runtime.trap("Unauthorized");
    };
    switch (users.get(userId)) {
      case (?user) {
        let requests = Array.tabulate(
          user.withdrawalRequests.size(),
          func(index : Nat) : CommissionWithdrawal {
            let withdrawal = user.withdrawalRequests[index];
            if (withdrawal.id == withdrawalId) {
              { withdrawal with status = #approved; approvedAt = ?Time.now() };
            } else {
              withdrawal;
            };
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
      Runtime.trap("Unauthorized");
    };
    supportLink.add(key, link);
  };

  public query func getSupportLink(key : Text) : async ?Text {
    supportLink.get(key);
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func deleteUser(userId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    users.remove(userId);
  };

  public shared ({ caller }) func activateFundsBatch(codes : [(Text, FundActivation)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    for ((code, activation) in codes.vals()) {
      activationCodes.add(code, activation);
    };
  };

  public query ({ caller }) func getFundActivationCodes() : async [FundActivation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    activationCodes.values().toArray();
  };

  public shared ({ caller }) func useActivationCode(code : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (principalToUserId.get(caller)) {
      case (?userId) {
        switch (activationCodes.get(code)) {
          case (?activation) {
            if (activation.isUsed) { Runtime.trap("Activation code already used") };
            let updatedActivation = { activation with isUsed = true; usedByUserId = ?userId };
            activationCodes.remove(code);
            activationCodes.add(code, updatedActivation);
            switch (users.get(userId)) {
              case (?user) {
                let updatedFunds = Array.tabulate(
                  user.activatedFunds.size(),
                  func(index : Nat) : FundToggle {
                    let f = user.activatedFunds[index];
                    if (f.fundType == activation.fundType) {
                      { fundType = f.fundType; isActive = true };
                    } else {
                      f;
                    };
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

  public shared ({ caller }) func showToast(_message : Text) : async () {};
};
