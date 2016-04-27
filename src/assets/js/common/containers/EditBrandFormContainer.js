import React, { Component } from 'react';
import { connect } from 'react-redux';
import BrandForm from '../components/forms/BrandForm';
import { reduxForm } from 'redux-form';
import _ from 'lodash';
import { brandEditFormSubmit } from '../actions/brands';

const mapStateToProps = (state, ownProps) => {
  return {
    flow: 'edit'
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: ownProps.handleSubmit((values) => {
      return new Promise((resolve, reject) => {
        dispatch(brandEditFormSubmit({
          values: {
            brandId: values.brandId,
            image: values.artwork[0],
            name: values.name,
          },
          isModal: true,
          resolve,
          reject
        }));
      });
    })
  };
};

const fields = ['brandId', 'artwork', 'name'];

let DecoratedComponent = BrandForm;
DecoratedComponent = connect(mapStateToProps, mapDispatchToProps)(DecoratedComponent);
DecoratedComponent = reduxForm({
  form: 'editBrand',
  fields,
},
(state, ownProps) => {
  const brand = ownProps.brand;

  return {
    initialValues: {
      brandId: brand.brandId,
      name: brand.name,
      media: brand.imgPreview
    }
  };
}
)(DecoratedComponent);

export default DecoratedComponent;