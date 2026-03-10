import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat32 "mo:core/Nat32";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Core Types
  public type Transaction = {
    id : Nat32;
    owner : Principal;
    amount : Int;
    transactionType : Text; // "income" or "expense"
    category : Text;
    note : Text;
    date : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  public type FinancialSummary = {
    totalIncome : Int;
    totalExpenses : Int;
    netBalance : Int;
  };

  // Core State
  let persistentTransactions = Map.empty<Nat32, Transaction>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var currentId : Nat32 = 0;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Supported categories
  let categoryList = List.fromArray(["Groceries", "Utilities", "Salary", "Dining", "Entertainment", "Transport", "Bills", "Supplies"]);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Transaction Management
  public shared ({ caller }) func addTransaction(amount : Int, transactionType : Text, category : Text, note : Text, date : Time.Time) : async Nat32 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    if (transactionType != "income" and transactionType != "expense") {
      Runtime.trap("Invalid transaction type: must be 'income' or 'expense'");
    };

    if (categoryList.find(func(item : Text) : Bool { item == category }) == null) {
      Runtime.trap("Invalid category");
    };

    let transaction : Transaction = {
      id = currentId;
      owner = caller;
      amount;
      transactionType;
      category;
      note;
      date;
    };
    persistentTransactions.add(currentId, transaction);
    currentId += 1;
    transaction.id;
  };

  public shared ({ caller }) func editTransaction(id : Nat32, amount : Int, transactionType : Text, category : Text, note : Text, date : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit transactions");
    };

    switch (persistentTransactions.get(id)) {
      case (?transaction) {
        if (transaction.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only edit your own transactions");
        };

        if (transactionType != "income" and transactionType != "expense") {
          Runtime.trap("Invalid transaction type: must be 'income' or 'expense'");
        };

        if (categoryList.find(func(item : Text) : Bool { item == category }) == null) {
          Runtime.trap("Invalid category");
        };

        let updatedTransaction : Transaction = {
          id = transaction.id;
          owner = transaction.owner;
          amount;
          transactionType;
          category;
          note;
          date;
        };
        persistentTransactions.add(id, updatedTransaction);
      };
      case (null) {
        Runtime.trap("Transaction not found");
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Nat32) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    switch (persistentTransactions.get(id)) {
      case (?transaction) {
        if (transaction.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own transactions");
        };
        persistentTransactions.remove(id);
      };
      case (null) {
        Runtime.trap("Transaction not found");
      };
    };
  };

  public query ({ caller }) func getTransaction(id : Nat32) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    switch (persistentTransactions.get(id)) {
      case (?transaction) {
        if (transaction.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own transactions");
        };
        transaction;
      };
      case (null) {
        Runtime.trap("Transaction not found");
      };
    };
  };

  public query ({ caller }) func listTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list transactions");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let userTransactions = persistentTransactions.entries().filter(
      func((_, transaction)) {
        isAdmin or transaction.owner == caller
      }
    );

    userTransactions.toArray().map<(Nat32, Transaction), Transaction>(
      func((_, transaction)) { transaction }
    );
  };

  public query ({ caller }) func getFinancialSummary() : async FinancialSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view financial summary");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    var totalIncome : Int = 0;
    var totalExpenses : Int = 0;

    for ((_, transaction) in persistentTransactions.entries()) {
      if (isAdmin or transaction.owner == caller) {
        if (transaction.transactionType == "income") {
          totalIncome += transaction.amount;
        } else if (transaction.transactionType == "expense") {
          totalExpenses += transaction.amount;
        };
      };
    };

    {
      totalIncome;
      totalExpenses;
      netBalance = totalIncome - totalExpenses;
    };
  };

  // Category Management
  public query ({ caller }) func getCategories() : async [Text] {
    // Categories are public information, no authorization needed
    categoryList.toArray();
  };
};
