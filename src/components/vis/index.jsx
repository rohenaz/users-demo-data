import React from 'react'
import { Group } from '@vx/group'
import { Cluster } from '@vx/hierarchy'
import { LinkVertical } from '@vx/shape'
import { hierarchy } from 'd3-hierarchy'
import { LinearGradient } from '@vx/gradient'

function userPattern(user) {
  return (
    <defs>
      <pattern id={user.payout_address} patternUnits="userSpaceOnUse" width="40" height="40">
        <image href={`https://bitpic.network/u/${user.payout_address}`} x="0" y="0" width="40" height="40"/>
      </pattern>
    </defs>
  )
}

function Node({ node }) {
  const isRoot = node.depth === 0
  const isParent = !!node.children

  if (isRoot) return <RootNode node={node} />

  return (
    <Group top={node.y} left={node.x}>
      {userPattern(node.data)}
      {node.depth !== 0 && (
        <circle
          r={20}
          fill={`url(#${node.data.payout_address})`}
          stroke={isParent ? merlinsbeard : citrus}
          onClick={() => {
            alert(`clicked: ${JSON.stringify(node.data.payout_address)}`)
          }}
        />
      )}
      <text
        dy={'.33em'}
        fontSize={9}
        fontFamily="Arial"
        textAnchor={'middle'}
        style={{ pointerEvents: 'none' }}
        fill={isParent ? white : citrus}
      >
        {node.data.payout_address}
      </text>
    </Group>
  )
}

function RootNode({ node }) {
  const width = 80
  const height = 20
  const centerX = -width / 2
  const centerY = -height / 2

  return (
    <Group top={node.y} left={node.x}>
      <rect width={width} height={height} y={centerY} x={centerX} fill="url('#top')" />
      <text
        dy={'.33em'}
        fontSize={12}
        fontFamily="Arial"
        textAnchor={'middle'}
        style={{ pointerEvents: 'none' }}
        fill={bg}
      >
        {node.data.payout_address}
      </text>
    </Group>
  )
}

export default ({
  tree,
  width,
  height,
  margin = {
    top: 40,
    left: 0,
    right: 0,
    bottom: 40
  }
}) => {
  const data = hierarchy(tree)
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  return (
    <svg width={width} height={height}>
      <LinearGradient id="top" from={green} to={aqua} />
      <rect width={width} height={height} fill={bg} />
      <Cluster root={data} size={[xMax, yMax]}>
        {cluster => {
          return (
            <Group top={margin.top} left={margin.left}>
              {cluster.links().map((link, i) => {
                return (
                  <LinkVertical
                    key={`cluster-link-${i}`}
                    data={link}
                    stroke={merlinsbeard}
                    strokeWidth="1"
                    strokeOpacity={0.2}
                    fill="none"
                  />
                )
              })}
              {cluster.descendants().map((node, i) => {
                return <Node key={`cluster-node-${i}`} node={node} />
              })}
            </Group>
          )
        }}
      </Cluster>
    </svg>
  )
}

const citrus = '#ddf163';
const white = '#ffffff';
const green = '#79d259';
const aqua = '#37ac8c';
const merlinsbeard = '#333';
const bg = '#111';
