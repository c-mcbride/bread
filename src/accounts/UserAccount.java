package accounts;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.math.BigDecimal;
import java.util.Set;

/**
 * This class stores a user account, it has a name,
 * Bank Account list, variable and fixed expenses lists
 */
public class UserAccount {
    private String accountName;
    private List<BankAccount> bankAccounts;
    private List<BudgetItem> fixedExpenses; //List of fixed expenses budget items
    private List<BudgetItem> variableExpenses;
    private BudgetItem toBeBudgted; //Holds money that needs to be delegated to budget items
    private Set<String> categories; //Dynamic category list, will be used later for transaction choices


    public UserAccount(String accountName){
        this.accountName = accountName;
        this.bankAccounts = new ArrayList<>(); //Empty List
        this.fixedExpenses = new ArrayList<>();
        this.variableExpenses = new ArrayList<>();
        this.categories = new HashSet<>();
        //When object is constructed, we created a To Be Budgeted item, of ENUM:TOBEBUDGTED, with zero dollars
        this.toBeBudgted = new BudgetItem("To Be Budgeted", BudgetType.TOBEBUDGTED, BigDecimal.ZERO);
    }

    //Getters
    public String getAccountName(){
        return accountName;
    }

    //Getters for both expenses list
    public List<BudgetItem> getFixedExpenses(){
        return Collections.unmodifiableList(fixedExpenses);
    }

    public List<BudgetItem> getVariableExpenses(){
        return Collections.unmodifiableList(variableExpenses);
    }

    //Returning an unmodifiable view to prevent external code from modifying this directly
    public List<BankAccount> getBankAccounts() {
        return bankAccounts;
    }

    /**
     * Adds to the fixed expenses budget Item list
     * @param name name of the budget item
     * @param amount amount of money to add to the item on creation
     */
    public void addFixedBudgetItem(String name, BigDecimal amount){
        validateBudgetItem(name, amount);
        fixedExpenses.add(new BudgetItem(name, BudgetType.FIXED, amount));
        addCategoryToSet(name);
    }

    /**
     * Adds to the variable expenses category
     * @param name name of the budget item
     * @param amount amount of money to add once the item is created
     */
    public void addVariableBudgetItem(String name, BigDecimal amount){
        validateBudgetItem(name, amount);
        variableExpenses.add(new BudgetItem(name, BudgetType. VARIABLE, amount));
        addCategoryToSet(name);
    }

    //Methods to add/remove bank accounts or budget Items
    public void addBankAccount(BankAccount bankAccount){
        bankAccounts.add(bankAccount);
    }

    /**
     * Looks for bankaccount to remove 
     * @param bankAccount bankAccount to remove
     */
    public void removeBankAccount(BankAccount bankAccount){
        if(!bankAccounts.remove(bankAccount)){
            throw new IllegalArgumentException("Bank account not found");
        }
        bankAccounts.remove(bankAccount);
    }

    /**
     * Used to modify the toBeBudget object variable
     * @param toBeBudgted the amount to add to the toBeBudgeted category
     */
    public void addAmountToBeBudgted(BigDecimal toBeBudgted){
        this.toBeBudgted.addMoneyToCategory(toBeBudgted);
    }

    /**
     * Goes to the amount to be budgeted budget item and gets the amount left to spend
     * @return amount to spend in the to be budgeted category
     */
    public BigDecimal getAmountToBeBudgeted(){
        return this.toBeBudgted.getAmountToSpend();
    }

    /**
     * Add a new category, will be added when a new budget Item is created
     * @param category these will be used for transactions later to pull money from
     */
    public void addCategoryToSet(String category){
        categories.add(category);
    }

    /**
     * Checks to see if the category exists in the category set
     * @param category this is what we are looking for
     * @return boolean shows if the item is in the set or not
     */
    public boolean isValidCategory(String category){
        return categories.contains(category);
    }

    /**
     * Validates if a BankAccount with the given name exists in UserAccount
     * @param name name of the bank account to check for
     * @return boolean of it the account exists or not
     */
    public boolean hasBankAccount(String name){
        for(BankAccount account : bankAccounts){
            if(account.getName().equalsIgnoreCase(name)){
                return true;
            }
        }

        return false;
    }

    /**
     * Checks to see if there is an account with the given name in the list, if not returns null..if so return that account
     * @param name entered name for the bank account
     * @return the bankaccount with the given name if it exists
     */
    public BankAccount getBankAccountByName(String name){
        for(BankAccount account : bankAccounts){
            if(account.getName().equalsIgnoreCase(name)){
                return account;
            }
        }

        return null;
    }
    /**
     * Used to get the full list of budget categories
     * @return set of categories associated with the user account
     */
    public Set<String> getCategories(){
        return Collections.unmodifiableSet(categories);
    }

    private void validateBudgetItem(String name, BigDecimal amount){
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Budget item name cannot be null or blank");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must be a non-negative value");
        }
    }
}
