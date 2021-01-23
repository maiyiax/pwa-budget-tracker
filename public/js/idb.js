// create variable to hold db connection
let db;

// establish a connection to IndexDB database
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes
request.onupgradeneeded = function (event) {
    // save a reference to the database
    const db = event.target.result;

    // create an object store and set it to have an autoincrementing primary key
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

// upon successful connection
request.onsuccess = function (event) {
    // when db is successfully created with its object store or established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online
    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = function (event) {
    // log error
    console.log(event.target.errorCode);
};

// if new transaction is submitted while offline
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction([ 'new_transaction' ], 'readwrite');

    // access objectstore for new transactions
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to store
    transactionObjectStore.add(record);
};

// collect data from objectStore and Post it to the server when connected
function uploadTransactions() {
    // open a transaction on db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the objectStore
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction([ 'new_transaction'], 'readwrite');

                // access new_transaction object store
                const transactionObjectStore = transaction.objectStore('new_transaction');

                // clear all items in store
                transactionObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => console.log(err));
        }
    }
};

// listen for app coming back online
window.addEventListener('online', uploadTransactions);