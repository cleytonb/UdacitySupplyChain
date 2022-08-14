App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.sku,
            App.upc,
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes, 
            App.productPrice, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];
            $('#account').val(res[0])
        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        web3.eth.defaultAccount = web3.eth.accounts[0];

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchEvents();
            App.fetchRole();

        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            case 11:
                return await App.registerFarmer(event);
                break;
            case 12:
                return await App.registerDistributor(event);
                break;
            case 13:
                return await App.registerRetailer(event);
                break;
            case 14:
                return await App.registerConsumer(event);
                break;
            case 15:
                return await App.retailSellItem(event);
                break;
            }
    },

    updateFtcItem1: function (item) {
        $('#ftc-item-sku').val(item[0]);
        $('#ftc-item-upc').val(item[1]);
        var state = '';
        switch(item[2].toString()) {
            case '0': 
                state = 'Harvested';
                break;
            case '1': 
                state = 'Processed';
                break;
            case '2': 
                state = 'Packed';
                break;
            case '3': 
                state = 'ForSale';
                break;
            case '4': 
                state = 'Sold';
                break;
            case '5': 
                state = 'Shipped';
                break;
            case '6': 
                state = 'Received';
                break;
            case '7': 
                state = 'ForRetailSale';
                break;
            case '8': 
                state = 'Purchased';
                break;
        }
        $('#ftc-item-state').val(state);
        $('#ftc-item-owner').val(item[3]);
        $('#ftc-item-farm-id').val(item[4]);
        $('#ftc-item-farm-name').val(item[5]);
        $('#ftc-item-farm-info').val(item[6]);
        $('#ftc-item-farm-lat').val(item[7]);
        $('#ftc-item-farm-lng').val(item[8]);
    },

    updateFtcItem2: function (item) {
        $('#ftc-item-product-id').val(item[2]);
        $('#ftc-item-product-notes').val(item[3]);
        $('#ftc-item-product-price').val(item[4]);
        $('#ftc-item-retail-price').val(item[5]);
        $('#ftc-item-distributor-id').val(item[6]);
        $('#ftc-item-retailer-id').val(item[7]);
        $('#ftc-item-consumer-id').val(item[8]);
    },

    fetchRole: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            var promises = [];
            promises.push(instance.isFarmer(App.metamaskAccountID));
            promises.push(instance.isDistributor(App.metamaskAccountID));
            promises.push(instance.isRetailer(App.metamaskAccountID));
            promises.push(instance.isConsumer(App.metamaskAccountID));

            return Promise.all(promises);
        }).then(function(results) {
            if (results[0]) {
                $('#accountRole').val('Farmer');
            }
            else if (results[1]) {
                $('#accountRole').val('Distributor');
            }
            else if (results[2]) {
                $('#accountRole').val('Retailer');
            }
            else if (results[3]) {
                $('#accountRole').val('Farmer');
            }
            else {
                $('#accountRole').val('None. Please register.');
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    registerFarmer: function(event) {
        var newAccount = $('#newAccount').val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addFarmer(newAccount);
        }).then(function(result) {
            App.fetchRole(event);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    registerDistributor: function(event) {
        var newAccount = $('#newAccount').val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addDistributor(newAccount);
        }).then(function(result) {
            App.fetchRole(event);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    registerRetailer: function(event) {
        var newAccount = $('#newAccount').val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addRetailer(newAccount);
        }).then(function(result) {
            App.fetchRole(event);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    registerConsumer: function(event) {
        var newAccount = $('#newAccount').val();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addConsumer(newAccount);
        }).then(function(result) {
            App.fetchRole(event);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.harvestItem(
                App.upc, 
                App.metamaskAccountID, 
                App.originFarmName, 
                App.originFarmInformation, 
                App.originFarmLatitude, 
                App.originFarmLongitude, 
                App.productNotes
            );
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('harvestItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.processItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('processItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    
    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.packItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('packItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const productPrice = web3.toWei(100, "gwei");
            console.log('productPrice',productPrice);
            return instance.sellItem(App.upc, productPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('sellItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buyItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const walletValue = web3.toWei(300, "gwei");
            return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('buyItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('shipItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('receiveItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    retailSellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const retailProductPrice = web3.toWei(150, "gwei");
            return instance.retailSellItem(App.upc, retailProductPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('retailSellItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const retailProductPrice = web3.toWei(250, "gwei");
            return instance.purchaseItem(App.upc, {from: App.metamaskAccountID, value: retailProductPrice});
        }).then(function(result) {
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            console.log('purchaseItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchItemBufferOne: function () {
    ///   event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc',App.upc);

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferOne(App.upc);
        }).then(function(result) {
          App.updateFtcItem1(result);
          console.log('fetchItemBufferOne', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferTwo: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
                        
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferTwo.call(App.upc);
        }).then(function(result) {
          App.updateFtcItem2(result);
          console.log('fetchItemBufferTwo', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
