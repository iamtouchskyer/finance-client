import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';
import ReactTable from "react-table";
import { Layout, Menu, Breadcrumb, Icon, Spin } from 'antd';

import Filter from './filter';

const { Header, Content, Footer, Sider } = Layout;

class LatestStockBonusRate extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      dividend_rate: -1 
    };

    this.theInterval = null;
  }

  fetchPrice = () => {
    axios.get('http://localhost:3030/api/v1/stock/dividend', {
      params: {
        region: this.props.region,
        symbol: this.props.symbol,
      },
    })
    .then(response => {
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Something went wrong on api server!');
      }
    })
    .then(response => {
        this.setState({
          dividend_rate : response.dividend_rate
        });
    }).catch(error => {
      console.error(error);
    });
  }

  componentDidMount() {
    this.fetchPrice();

    this.theInterval = setInterval(this.fetchPrice, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.theInterval);
  }

  render() {
    if (this.state.dividend_rate < 0)
      return <Spin />;
    else
      return this.state.dividend_rate > 4 ? (<span style={{ color: 'red' }}><Icon type="rise" theme="outlined" />{this.state.dividend_rate}</span>)
              : this.state.dividend_rate > 3 ? (<span  style={{ color: 'orange' }}><Icon type="rise" theme="outlined" />{this.state.dividend_rate}</span>)
              : (<span  style={{ color: 'green' }}><Icon type="fall" theme="outlined" />{this.state.dividend_rate}</span>)
  }
}


class LatestStockPrice extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      price: -1 
    };

    this.theInterval = null;
  }

  fetchPrice = () => {
    axios.get('http://localhost:3030/api/v1/stock/latestprice', {
      params: {
        region: this.props.region,
        symbol: this.props.symbol,
      },
    })
    .then(response => {
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Something went wrong on api server!');
      }
    })
    .then(response => {
        this.setState({
          price : response['currentPrice']
        });
    }).catch(error => {
      console.error(error);
    });
  }

  componentDidMount() {
    this.fetchPrice();

    this.theInterval = setInterval(this.fetchPrice, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.theInterval);
  }

  render() {
    if (this.state.price < 0)
      return <Spin />;
    else
      return <span>{this.state.price}</span>
  }
}
class StockList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
    };

    this.fullData = [];

    this.columns = [{
        Header: '股票',
        accessor: 'stockName',
        Cell: props => <a href={`./detail/${props.original.stockSymbol}`}>{props.value}</a>
      }, {
        Header: '股票代码',
        accessor: 'stockSymbol',
        Cell: props => <a href={`./detail/${props.value}`}>{props.value}</a>
      }, {
        Header: '地区',
        accessor: 'stockRegion',
      }, {
        Header: '当前价格',
        accessor: 'stockSymbol',
        Cell: props => <LatestStockPrice key={props.original.stockSymbol} region={props.original.stockRegion} symbol={props.original.stockSymbol} /> 
      }, {
        Header: '现金分红率',
        accessor: 'stockDividendRate',
        Cell: props => <LatestStockBonusRate key={props.original.stockSymbol} region={props.original.stockRegion} symbol={props.original.stockSymbol} /> 
      }, {
        Header: '投入资本回报率(ROIC)',
        id: 'roic', // Required because our accessor is not a string
        columns: this.sharedColumns('roic'),
        Cell: props => <strong>{props.value}</strong>
      }, {
        Header: '净资产回报率(ROE)',
        id: 'roe', // Required because our accessor is not a string
        columns: this.sharedColumns('roe'),
      }, {
        Header: '资产回报率(ROA)',
        id: 'roa', // Required because our accessor is not a string
        columns: this.sharedColumns('roa'),
      }];
  }

  componentDidMount() {
    axios.get('http://localhost:3030/api/v1/metadata/advanced', {
        params: {
          page: 0,
          size: 5000,
        },
      })
      .then(response => {
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error('Something went wrong on api server!');
        }
      })
      .then(response => {
        console.debug(response);

        this.fullData = [...response];

        this.setState({
          data : response
        });
      }).catch(error => {
        console.error(error);
      });
  }

  sharedColumns = (metric) =>
    _.map(['2017', '2016', '2015', '2014', '2013'], (yr) => {
      return {
        Header: yr,
        accessor: `${metric}.${yr}`
      };
    });
    
  doSearch = (props) => {
    let data = [...this.fullData];

    data = _.filter(data, (item) => {
      if (props.roic.enabled) {
        const flag = _.every(item.roic, (value) => value > props.roic.percentage);

        if (!flag || _.isEmpty(item.roic)) return false;
      }

      if (props.roe.enabled) {
        const flag = _.every(item.roe, (value) => value > props.roe.percentage);

        if (!flag || _.isEmpty(item.roe)) return false;
      }

      if (props.roa.enabled) {
        const flag = _.every(item.roa, (value) => value > props.roa.percentage);

        if (!flag || _.isEmpty(item.roa)) return false;
      }

      return true;
    });

    this.setState({
      data: data
    });
  }

  render() {
    return (
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>

          <Filter doSearch={this.doSearch.bind(this)} />

          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <ReactTable
              data={this.state.data}
              columns={this.columns}
            >
          </ReactTable>
          </div> 
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Hello World
        </Footer>
      </Layout>
    );
  }
}

export default StockList;
