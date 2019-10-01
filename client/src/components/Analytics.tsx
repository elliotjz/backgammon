import * as React from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';

import { StatsGameI } from '../helpers/interfaces';
import Button from './Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    margin-top: 1em;
  }

  .info {
    margin-top: 1em;
    text-align: center;
    font-size: 0.9em;
  }
`;

interface StateI {
  gamesInProgress: number,
}

interface PropsI {}

class Analytics extends React.Component<PropsI, StateI> {
  state = {
    gamesInProgress: 0,
  }

  componentDidMount() {
    this.getStats();
  }

  getStats = async () => {
    const http = window.location.host === 'localhost:3000' ? 'http' : 'https';
    const url= `${http}://${window.location.host}/api/stats`;
    const res = await fetch(url);
    const resJson = await res.json();
    this.setState({ gamesInProgress: resJson.length });
    this.drawChart(this.parsedResults(resJson));
  }

  parsedResults = (gameData: StatsGameI[]) => {
    const parsedData: number[] = [];
    gameData.forEach(game => {
      game.gameState.pieces.forEach((playerPieces, i) => {
        const count = i % 2 === 0 ?
          playerPieces.reduce((sum, spike) => sum + 24 - spike, 0) :
          playerPieces.reduce((sum, spike) => sum + spike + 1, 0);
        parsedData.push(count);
      })
    });
    return parsedData;
  }

  drawChart = (values: number[]) => {
    const padding = 40;
    const barHeight = 50;
    const height = values.length * barHeight + 2 * padding;
    const width = 600;
    const maxValue = values.reduce((max, val) => max = val > max ? val : max, 0);
    const pxPerNum = (width - 2 * padding) / maxValue;

    // Clear contents
    document.getElementsByClassName('chart')[0].innerHTML = '';
    // SVG element
    const svg = d3.select('.chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    const g = svg.append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Bars
    g.selectAll('rect')
      .data(values)
      .enter()
      .append('rect')
      .attr('y', (val, i) => i * barHeight)
      .attr('width', (val, i) => val * pxPerNum)
      .attr('height', barHeight - 5)
      .attr('fill', (val, i) => i % 2 === 0 ? '#a0dea9' : '#dea0a0');

    // Text on bars
    g.selectAll('text')
      .data(values)
      .enter()
      .append('text')
      .text((val, i) => {
        const gameNum = Math.floor(i / 2) + 1;
        const playerNum = i % 2 === 0 ? 1 : 2;
        return `Game ${gameNum}, Player ${playerNum}`;
      })
      .attr('x', 2)
      .attr('y', (val, i) => (i + 0.5) * barHeight);
    
    // Axes
    const xScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([padding, width - padding]);
    
    const yScale = d3.scaleLinear()
      .domain([values.length, 0])
      .range([padding, height - padding]);
    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(0);

    svg.append('g')
      .attr('transform', `translate(0, ${height - padding})`)
      .call(xAxis);
    
    svg.append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis);
    
    // X Axis label
    svg.append('text')
      .text('Number of spikes from end')
      .attr('x', width / 2 - 80)
      .attr('y', height - 5);
  }

  render() {
    const { gamesInProgress } = this.state;
    return (
      <Container>
        <h1>Analytics</h1>
        <p><b>Games in progress:</b> {gamesInProgress}</p>
        <div className="chart"></div>
        <Button handleClick={this.getStats} text="Update Chart" disabled={false} />
        <p className="info">
          <b>Info:</b><br />
          This chart keeps track of how far each player is from winning the game.<br />
          As players move their pieces closer to the home zones, their bars will shrink towards zero.
        </p>
      </Container>
    );
  }
}

export default Analytics;
