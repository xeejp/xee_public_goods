import React, { Component } from 'react'
import { connect } from 'react-redux'
import throttle from 'react-throttle-render'
import ReactHighcharts from 'react-highcharts'
import HighchartsMore from 'highcharts-more'
import { Card, CardHeader, CardText } from 'material-ui/Card'
HighchartsMore(ReactHighcharts.Highcharts)

function computeQuartile(array, length, n, d) {
  const pos = (length - 1.0) * n / d

  const divisible = (length - 1) % d == 0
  if (divisible) {
    return array[Math.trunc(pos)]
  } else {
    const posInt = Math.trunc(pos)
    const ratio1 = pos - posInt
    const ratio2 = 1.0 - ratio1
    return array[posInt] * ratio2 + array[posInt + 1] * ratio1
  }
}

const mapStateToProps = ({investment_log, maxRound}) => {
  const data = Array.from(Array(maxRound).keys()).map(() => [])
  if(!investment_log) investment_log = []
  investment_log.forEach(({round, investments}) => {
    Array.prototype.push.apply(data[round], investments)
  })
  const finalData = data.map(investments => {
    investments.sort((a, b) => a - b)
    length = investments.length
    const low = investments[0]
    const q1 = computeQuartile(investments, length, 1, 4)
    const median = computeQuartile(investments, length, 1, 2)
    const q2 = computeQuartile(investments, length, 3, 4)
    const high = investments[length - 1]
    return [low, q1, median, q2, high]
  })
  const lineData = finalData.map(list => list[2])
  const config = {
    chart: {
      type: 'boxplot'
    },
    title: {
      text: '公共財投資額の推移'
    },
    legend: {
      enabled: false
    },
    xAxis: {
      categories: Array.from(Array(maxRound).keys()).map(x => (x + 1).toString()),
        title: {
          text: 'ラウンド数'
        }
    },
    yAxis: {
      title: {
        text: '投資額'
      },
    },
    series: [{
      name: '投資額',
      data: finalData,
      tooltip: {
        headerFormat: '<em>{point.key}回目</em><br/>'
      }
    }, {
      type: "line",
      data: lineData
    }]
  }
  return {
    display: investment_log.length > 0,
    config
  }
}

const Graph = ({ config, display }) => (
  <div>
    <Card>
      <CardHeader
        title="グラフ"
        actAsExpander={true}
        showExpandableButton={true}
      />
      <CardText expandable={true}> 
        {display
          ? <ReactHighcharts config={config} />
          : <p>データがないためグラフは表示できません。</p>}
      </CardText>
    </Card>
  </div>
)

export default connect(mapStateToProps)(throttle(Graph, 200))