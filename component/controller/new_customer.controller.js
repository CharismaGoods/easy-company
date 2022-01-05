sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/Core',
	'sap/ui/model/SimpleType',
	'sap/ui/model/ValidateException'
], function (Controller, JSONModel, Core, SimpleType, ValidateException) {
	"use strict";

	return Controller.extend('src.controller.new_customer', {

		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute('new_customer').attachMatched(this._onNewCustomer, this);
			this.getOwnerComponent().getRouter().getRoute('edite_customer').attachMatched(this._onEditeCustomer, this);
			
			let oMM = Core.getMessageManager();			
			oMM.registerObject(this.byId('customer_name'), true);
			oMM.registerObject(this.byId('customer_company'), true);
			oMM.registerObject(this.byId('customer_street'), true);
			oMM.registerObject(this.byId('customer_house_no'), true);
			oMM.registerObject(this.byId('customer_tel'), true);
			oMM.registerObject(this.byId('customer_mobile'), true);
			oMM.registerObject(this.byId('customer_zip'), true);
			oMM.registerObject(this.byId('customer_city'), true);
			oMM.registerObject(this.byId('customer_email'), true);
			oMM.registerObject(this.byId('customer_web'), true);
		},
		_onNewCustomer: function() {
			this.ajaxRequestType = 'POST';
			let oView = this.getView();
			oView.setModel(new JSONModel({is_wholesaler: 0}), 'customer');
		},
		_onEditeCustomer: function(oEvent) {
			console.log('_onEditeCustomer');
			this.ajaxRequestType = 'PUT';
			let id = decodeURIComponent(oEvent.getParameter('arguments').id),
			oView = this.getView(),
			oModel = new JSONModel;
			oModel.attachRequestFailed(()=>{
				MessageToast.show('data request failed!');
				oView.setBusy(false);
			});
			oView.setBusy(true);
			oModel.loadData(`http://3.70.92.77:3000/api/clients/${id}`).then(function() {
				oView.setBusy(false);
				oView.setModel(oModel, 'customer');
			});
		},

		onRadioGroupChange: function(oEvent) {
			let RadioButton = oEvent.getSource().getSelectedButton(),
			oModel = this.getView().getModel('customer');
			if (RadioButton.getText() === 'yes') {
				oModel.setProperty('/is_wholesaler', 1);
			} else {
				oModel.setProperty('/is_wholesaler', 0);
			}
		},
		onChange: function(oEvent) {
			let oInput = oEvent.getSource();
			this._validateInput(oInput);
		},
		_validateInput: function (oInput) {
			let sValueState = 'None',
			bValidationError = false,
			oBinding = oInput.getBinding("value");
			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}
			oInput.setValueState(sValueState);
			return bValidationError;
		},
		email: SimpleType.extend("email", {
			formatValue: function (sValue) {
				return sValue;
			},
			parseValue: function (sValue) {
				//parsing step takes place before validating step, value could be altered here
				return sValue;
			},
			validateValue: function (sValue) {
				// The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
				// It's always better to validate an address by simply sending an e-mail to it.
				var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (sValue && !sValue.match(rexMail)) {
					throw new ValidateException(`'${sValue}' is not a valid e-mail address`);
				}
			}
		}),
		url: SimpleType.extend("url", {
			formatValue: function (sValue) {
				return sValue;
			},
			parseValue: function (sValue) {
				//parsing step takes place before validating step, value could be altered here
				return sValue;
			},
			validateValue: function (sValue) {
				// The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
				// It's always better to validate an address by simply sending an e-mail to it.
				var rexWeb = /^\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (sValue && !sValue.match(rexWeb)) {
					throw new ValidateException("'" + sValue + "' is not a valid web address");
				}
			}
		}),

		onSave: function (oEvent) {
			// collect input controls
			let aInputs = [
				this.byId('customer_name'),
				this.byId('customer_company'),
				this.byId('customer_street'),
				this.byId('customer_house_no'),
				this.byId('customer_zip'),
				this.byId('customer_city'),
				this.byId('customer_email'),
				this.byId('customer_web')
			],
			bValidationError = false;
			aInputs.forEach(function (oInput) {
				bValidationError = this._validateInput(oInput) || bValidationError;
			}, this);
			
			if (!bValidationError) {
				let oController = this,
				oModel = this.getView().getModel('customer');
				console.log(oModel.getJSON());			
				$.ajax({
					contentType: 'application/json',
					data: oModel.getJSON(),
					// data: JSON.stringify(oCustomer),
					dataType: 'json',
					success: function () {
						oController.getOwnerComponent().getRouter().navTo('customers');
					},
					error: function (err) {
						console.log(err);
					},
					processData: false,
					type: oController.ajaxRequestType,
					url: 'http://3.70.92.77:3000/api/clients'
				});
			} else {
				console.log("A validation error has occurred. Complete your input first.");
				console.log(this.getView().getModel('customer').getJSON());			
			}
		},
		onCancel: function () {
			this.getOwnerComponent().getRouter().navTo('customers');
		}
	});
});