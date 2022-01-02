sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library"
], function (Controller, Popover, Button, library) {
	"use strict";

	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType;

	return Controller.extend("src.controller.main", {

		onInit: function () {
			let oRouter = this.getOwnerComponent().getRouter();
			oRouter.attachRouteMatched(this.onRouteMatched, this);
		},
		
		onRouteMatched: function(oEvent) {
			let sRouteName = oEvent.getParameter('name');
			if (sRouteName === 'app') {
				this.getOwnerComponent().getRouter().navTo('customers');
			} else {
				if (sRouteName.match(/\+$/)) {
					sRouteName = sRouteName.slice(0, -1);
				}
				let oPagesTree = this.getOwnerComponent().getModel('pagesTree');
				oPagesTree.setProperty("/selectedKey", sRouteName);
			}
		},

		onItemSelect: function(oEvent) {
			const oItem = oEvent.getParameter("item");
			//this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
			this.getOwnerComponent().getRouter().navTo(oItem.getKey());
		},

		handleUserNamePress: function (event) {
			let oController = this;
			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [
					new Button({
						text: 'Feedback',
						type: ButtonType.Transparent,
						press: [oController.onFeedback, oController]
						
					}),
					new Button({
						text: 'Help',
						type: ButtonType.Transparent,
						press: [oController.onHelp, oController]
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

			oPopover.openBy(event.getSource());
		},
		onFeedback: function() {
			sap.m.URLHelper.triggerEmail(
				'mohammad.badenjki@sap.com',
				'Feedback on SLC Reporting UI'
			);
		},
		onHelp: function() {
			let sUrl = 'https://wiki.wdf.sap.corp/wiki/';
			if (this.getOwnerComponent().getModel('user').getProperty('/SLCMemberBoolean')) {
				sUrl += 'display/SLCinternal/SLC+Reporting';
			}
			window.open(sUrl);
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		}

	});
});