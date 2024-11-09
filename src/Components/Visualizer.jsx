import React, { useState, useRef } from 'react';
import * as d3 from 'd3';
import { isAddress } from 'ethers';
import axios from 'axios';
import { DevUrl } from '../Constants';

const Visualizer = () => {
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value.trim());
  };

  const validateWalletAddress = (address) => isAddress(address);

  const validateTransactionHash = (hash) => /^0x([A-Fa-f0-9]{64})$/.test(hash);

  const handleScanClick = async () => {
    const value = inputValue;

    if (validateWalletAddress(value)) {
      setLoading(true);

      try {
        const response = await axios.post(
          `${DevUrl}/token-transfers/`,
          { address: value },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response.data);

        const combinedTransfers = response.data.from.concat(response.data.to);
        renderGraph(value, combinedTransfers);
        setValidationMessage('Valid wallet address found!');
      } catch (error) {
        console.log('Error:', error);
        setValidationMessage('Error retrieving data.');
      }
      setLoading(false);
    } else {
      setValidationMessage('Invalid input. Please enter a valid wallet address.');
    }
  };

  const renderGraph = (centerAddress, transactions) => {
    const nodes = [{ id: centerAddress, center: true }];
    const links = [];

    transactions.forEach((tx) => {
      const target = tx.to.toLowerCase() === centerAddress.toLowerCase() ? tx.from : tx.to;
      nodes.push({ id: target });
      links.push({ source: centerAddress, target, hash: tx.hash });
    });

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1400;
    const height = 600;

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke', '#555');
        tooltip
          .style('opacity', 1)
          .html(`Hash: ${d.hash}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', '#999');
        tooltip.style('opacity', 0);
      });

    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => (d.center ? 15 : 10))
      .attr('fill', (d) => (d.center ? '#40a9f3' : '#69b3a2'))
      .call(drag(simulation))
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#40a9f3');
        tooltip
          .style('opacity', 1)
          .html(`Address: ${d.id}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', function (d) {
        d3.select(this).attr('fill', d.center ? '#40a9f3' : '#69b3a2');
        tooltip.style('opacity', 0);
      });

    const text = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('dy', -15)
      .attr('dx', 10)
      .text((d) => d.id.substring(0, 6) + '...');

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('text-align', 'left')
      .style('width', '200px')
      .style('padding', '8px')
      .style('font', '12px sans-serif')
      .style('background', 'lightsteelblue')
      .style('border', '1px solid #fff')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      text
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });

    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center py-10 px-4 bg-white">
        <h1 className="text-3xl font-bold text-center mb-4">SecureTrace</h1>
        <p className="text-center text-gray-600 mb-6 max-w-2xl font-semibold">
          SecureTrace analyzes transaction data using blockchain forensic techniques, enhancing the detection of intricate patterns and potential vulnerabilities.
        </p>
        <div className="flex flex-col sm:flex-row items-center w-full md:max-w-3xl ">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter transaction hash or address value"
            className="py-3 px-4 rounded-xl border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 sm:mb-0 sm:mr-4 w-full"
          />
          <button onClick={handleScanClick} className="bg-green-500 w-40 text-black font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-green-600 transition-all duration-300">
            {loading ? 'Loading...' : 'Scan Now'}
          </button>
        </div>
        {validationMessage && (
          <p className={`ml-10 mt-2 ${validationMessage.includes('Invalid') ? 'text-red-500' : 'text-green-500'}`}>
            {validationMessage}
          </p>
        )}
        <div>
          <svg ref={svgRef}></svg>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
