import React, { Component } from 'react';
import _ from 'lodash';

class BrandSelectorOptions extends Component {
  render() {
    return (
      <div className="selector__option">
        <div className="selector__option__primary">
          <button type="button" onClick={this.props.onOptionClick}>
            {this._renderCore()}
          </button>
        </div>
        <div className="selector__option__secondary">
          <button type="button" onClick={this.props.onViewClick}>
            <i className="icons8-visible"/>
          </button>
          <button type="button" onClick={this.props.onEditClick}>
            <i className="icons8-settings"/>
          </button>
        </div>
      </div>
    );
  }

  _renderCore() {
    if(this.props.imgSrc == null) {
      return (
        <span>{this.props.label}</span>
      );
    }

    return (
      <img src={this.props.imgSrc}/>
    );

  }
};

export default BrandSelectorOptions;