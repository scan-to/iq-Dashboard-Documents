import React, { Component } from 'react';
import { connect } from 'react-redux';
import BasicDetailsForm from '../components/forms/BasicDetailsForm';
import ui from 'redux-ui/transpiled';
import { openModal, updateModalPath, updateModalData } from 'app/modal/actions';
import _ from 'lodash';
import { createCampaign } from 'app/common/actions/campaigns';

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onBackClick: (e) => {
      //ownProps.updateUI('step', ownProps.ui.step - 1);
    },

    onSubmit: ownProps.handleSubmit((values) => {
      if(values.campaignId) {
        // Has already been uploaded, so it can be skipped.
        // Might just need to update the edited values.
        return;
      }

      return new Promise((resolve, reject) => {
        dispatch(createCampaign({
          values: {
            defaultBrand: ownProps.selectedBrandId,
            type: ownProps.selectedCampaignTypeId,
            name: values.campaignTitle,
            url: values.defaultTarget,
            language: values.magazineLanguage,
            image: values.media[0],
            periodFrom: values.campaignPeriodFrom,
            periodTo: values.campaignPeriodTo
          },
          updateUI: ownProps.updateUI,
          pagesAddField: ownProps.fields.pages.addField,
          form: 'createCampaignPrint',
          resolve,
          reject
        }));
      });
    }),

    onPreviewWebsiteClick: (e) => {
      dispatch(updateModalPath('previewWebsite'));
      dispatch(updateModalData({
        website: 'http://www.google.com/'
      }));
      dispatch(openModal());
    }
  };
};


let DecoratedComponent = BasicDetailsForm;
DecoratedComponent = connect(mapStateToProps, mapDispatchToProps)(DecoratedComponent);
DecoratedComponent = ui()(DecoratedComponent);

export default DecoratedComponent;