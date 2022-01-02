sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend('src.controller.new_customer', {

		onInit: function () {
			// set explored app's demo model on this sample
			// var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			// this.getView().setModel(oModel);
		},

		onSave: function (oEvent) {
		},
		onCancel: function () {
			this.getOwnerComponent().getRouter().navTo('customers');
		}
	});
});