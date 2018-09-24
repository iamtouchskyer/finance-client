import React, {Component, Fragment} from 'react';
import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import { Row, Col, Card, Radio } from 'antd';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

import theme1 from './assets/DaoTheme1.json';
import theme2 from './assets/DaoTheme2.json';
import theme3 from './assets/DaoTheme3.json';

const RadioGroup = Radio.Group;

class StockDetail extends Component {
  constructor(props) {
    super(props);

    echarts.registerTheme('theme1', theme1);
    echarts.registerTheme('theme2', theme2);
    echarts.registerTheme('theme3', theme3);

    this.metadata = ['pb', 'totalValue', 'pettm', 'petyr'];

    this.state = {
      showLoading: _.zipObject(this.metadata, _.times(_.size(this.metadata), (n) => true)),
      range: _.zipObject(this.metadata, _.times(_.size(this.metadata), (n) => {return {start:0, end:0};})),
      data: _.zipObject(this.metadata, _.times(_.size(this.metadata), (n) => [])),
    }

    this.fullData = _.zipObject(this.metadata, _.times(_.size(this.metadata), (n) => []));
  }

  componentDidMount() {
    axios.get('http://localhost:3030/api/v1/stock/detail', {
        params: {
          symbol: this.props.match.params.symbol,
          pb:true,
          totalValue:true,
          pettm:true,
          petyr:true,
        }
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
          data : {
            pb: response[0],
            totalValue: response[1],
            pettm: response[2],
            petyr: response[3],
          },
          showLoading: {
            pb: false,
            totalValue: false,
            pettm: false,
            petyr: false,
          },
          range: {
            pb: {
              start: 0,
              end: _.size(response[0]),
            },
            totalValue: {
              start: 0,
              end: _.size(response[1]),
            },
            pettm: {
              start: 0,
              end: _.size(response[2]),
            },
            petyr: {
              start: 0,
              end: _.size(response[3]),
            },
          },
        });
      }).catch(error => {
        console.error(error);
      });
  }

  generateWatermark = (waterMarkText) => {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 100;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.08;
    ctx.font = '30px Microsoft Yahei';
    ctx.translate(50, 50);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(waterMarkText, 0, 0);

    return canvas;
  }

  getOption = (theKey) => {
    const realData = 
          this.state.range[theKey].end - this.state.range[theKey].start === _.size(this.state.data[theKey]) ? 
            this.state.data[theKey] :
            this.state.data[theKey].slice(this.state.range[theKey].start, this.state.range[theKey].end);

    return {
      grid: { // 为了解决两边留白问题
        x: 30, //默认是80px
        y: 50, //默认是60px
        x2: 20, //默认80px
        y2: 50 //默认60px
      },
      backgroundColor: {
        type: 'pattern',
        image: this.generateWatermark('小婉美女'),
        repeat: 'repeat'
      },
      title: {
        left: 'center',
        text: '最近5年' + theKey + '数据',
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            animation: false,
            label: {
                backgroundColor: '#505765'
            }
        }
      },
      dataZoom: [
        {
          show: true,
          realtime: true,
        },
      ],
      xAxis: {
          type: 'category',
          data: _.map(realData, (item) => moment(item.date).format('L')),
      },
      yAxis: {
          type: 'value'
      },
      series: [{
          data: _.map(realData, (item) => item.value),
          type: 'line',
      }]
    };
  };

  onRangeChange = (theKey, e) => {
    let start, end;
    const targetValue = e.target.value;
    const totalSize = _.size(this.state.data[theKey]);

    [start, end] = targetValue === 1 ? 
                    [0, totalSize] : targetValue === 2 ? 
                      [totalSize - 365, totalSize] : targetValue === 3 ?
                        [totalSize - 182, totalSize] : targetValue === 4 ?
                          [totalSize - 90, totalSize] : [totalSize - 30, totalSize];
    let newRange = {...this.state.range};
    newRange[theKey] = {start:start, end:end};

    this.setState({
      range: newRange
    });
  };

  renderCard = (theKey) => {
    return (
      <Card
        key = {theKey}
        title={this.getOption(theKey).title.text}
        extra={
          <RadioGroup onChange={_.partial(this.onRangeChange.bind(this), theKey)}>
          <Radio value={1}>过去5年</Radio>
          <Radio value={2}>过去1年</Radio>
          <Radio value={3}>过去6个月</Radio>
          <Radio value={4}>过去3个月</Radio>
          <Radio value={5}>过去1个月</Radio>
        </RadioGroup>
        }
      >

      <Card.Grid style={ {width: '25%', height:'350px'} }>
        <Row>
          <Col>最低</Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>最高</Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>平均</Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>中位数</Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>当前百分位</Col>
          <Col></Col>
        </Row>
      </Card.Grid>
      <Card.Grid style={ {width: '75%', height:'350px'}}>
        <ReactEcharts
          option={this.getOption(theKey)}
          theme={"theme2"}
          showLoading={this.state.showLoading[theKey]}
          notMerge={true}
          lazyUpdate={true}
          style={{height: '300px', width: '100%'}}
        />
      </Card.Grid>
      </Card>
    );
  };

  render() {
    return (
      <Fragment>
        {_.map(this.metadata, (theKey) => this.renderCard(theKey))}
      </Fragment>
    );
  }
};

export default StockDetail;

