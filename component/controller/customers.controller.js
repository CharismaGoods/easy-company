sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Dialog',
	'sap/m/DialogType',
	'sap/m/Button',
	'sap/m/Text',
	'sap/m/MessageToast'
], function (Controller, JSONModel, Dialog, DialogType, Button, Text, MessageToast) {
	"use strict";
	
	return Controller.extend('src.controller.customers', {
		
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute('customers').attachMatched(this._loadData, this);
		},
		_loadData: function () {
			let oView = this.getView(),
			oModel = new JSONModel;
			oModel.attachRequestFailed(()=>{
				MessageToast.show('data request failed!');
				oView.setBusy(false);
			});
			oView.setBusy(true);
			oModel.loadData('http://3.70.92.77:3000/api/clients').then(function() {
				oView.setBusy(false);
			});
			oView.setModel(oModel, 'customers');
		},

		onNewCustomerClick: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo('new_customer');
		},
		onEdite: function (oEvent) {
			const bReplace = true,
			id = oEvent.getSource().getParent().getBindingContext('customers').getObject().id;
			this.getOwnerComponent().getRouter().navTo('edite_customer', {
				id : encodeURIComponent(id)
			}, bReplace);
		},
		onDelete: function (oEvent) {
			if (!this.oDeleteDialog) {
				this.oDeleteDialog = new Dialog({
					type: DialogType.Message,
					title: 'Confirm',
					content: new Text({ text: 'Do you want to delete this customer?' }),
					beginButton: new Button({
						// type: ButtonType.Emphasized,
						// icon='sap-icon://delete',
						text: 'Delete',
						press: function () {
							MessageToast.show("Delete pressed!");
							this.oDeleteDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: 'Cancel',
						press: function () {
							this.oDeleteDialog.close();
						}.bind(this)
					})
				});
			}
			this.oDeleteDialog.open();
		}
	});
});