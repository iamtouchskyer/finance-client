import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Row, Col, Select, Form, Checkbox, Tooltip, InputNumber, Button } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class HorizontalLoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roic : {
        enabled: false,
        years: 5,
        percentage: 15,
      },
      roa : {
        enabled: false,
        years: 5,
        percentage: 10,
      },
      roe : {
        enabled: false,
        years: 5,
        percentage: 15,
      },
    };
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  }

  checkBoxDidClick = (e) => {
    const theKey = e.target.id;

    const theNewValue = {...this.state[theKey]};
    theNewValue.enabled = !theNewValue.enabled;

    this.setState(_.zipObject([theKey], [theNewValue]));
  }

  searchBtnDidClick = (e) => {
    this.props.doSearch(this.state);   
  }

  yearsDidChange = (theKey, theValue) => {
    const theNewValue = {...this.state[theKey]};
    theNewValue.years = theValue;

    this.setState(_.zipObject([theKey], [theNewValue]));
  }

  percentageDidChange = (theKey, theValue) => {
    const theNewValue = {...this.state[theKey]};
    theNewValue.percentage = theValue;

    this.setState(_.zipObject([theKey], [theNewValue]));
  }

  renderItem = (theKey, theName) => {
    const tooltip = {
      'roic': "过去五年ROIC大于15%",
      'roa': "过去五年ROA大于10%",
      'roe': "过去五年ROE大于15%",
    };

    return (
      <Tooltip title={tooltip[theKey]}>
        <Checkbox style={{ width: '2%', marginRight: '1%' }} id={theKey} onChange={this.checkBoxDidClick.bind(this)}></Checkbox>
        <span style={{ width: '5%', marginRight: '1%' }} disabled={!this.state[theKey].enabled}>过去</span>
        <InputNumber style={{ width: '24%', marginRight: '1%' }} placeholder="5" id={theKey+'.years'} value={this.state[theKey].years} onChange={_.partial(this.yearsDidChange.bind(this), theKey)} disabled={!this.state[theKey].enabled}/>
        <span style={{ width: '18%', marginRight: '1%' }} disabled={!this.state[theKey].enabled}>年{theName}高于</span>
        <InputNumber style={{ width: '20%'}} placeholder="10%" id={theKey+'.percentage'} value={this.state[theKey].percentage} onChange={_.partial(this.percentageDidChange.bind(this), theKey)} disabled={!this.state[theKey].enabled}/>
      </Tooltip>
    );
  }

  render() {
    return (
        <Row>
          <Col xs={{ span: 12 }} sm={{ span:12 }} md = {{span:12}} lg={{ span: 6 }}>
            {this.renderItem('roic', 'ROIC')}
          </Col>

          <Col xs={{ span: 12 }} sm={{ span:12 }} md = {{span:12}} lg={{ span: 6 }}>
            {this.renderItem('roa', 'ROA')}
          </Col>

          <Col xs={{ span: 12 }} sm={{ span:12 }} md = {{span:12}} lg={{ span: 6 }}>
            {this.renderItem('roe', 'ROE')}
          </Col>

          <Col xs={{ span: 12 }} sm={{ span:12 }} md = {{span:12}} lg={{ span: 6 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.searchBtnDidClick.bind(this)}
                disabled={!this.state.roic.enabled && !this.state.roa.enabled && !this.state.roe.enabled}
              >
                搜索
              </Button>
          </Col>
        </Row>         
    );
  }
}

const WrappedHorizontalLoginForm = Form.create()(HorizontalLoginForm);

export default WrappedHorizontalLoginForm;