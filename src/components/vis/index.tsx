import React from 'react'
import { Group } from '@vx/group'
import { Cluster } from '@vx/hierarchy'
import { LinkVertical } from '@vx/shape'
import { hierarchy } from 'd3-hierarchy'
import { LinearGradient } from '@vx/gradient'
import { User } from 'ref-vis'

function userPattern(user: User) {
  return (
    <defs>
      <pattern id={user.payout_address} patternUnits="userSpaceOnUse" width="40" height="40">
        <image
          href={`https://bitpic.network/u/${paymail(user)}`}
          x="0"
          y="0"
          width="40"
          height="40"
        />
      </pattern>
    </defs>
  )
}

function paymail(user: User) {
  return user.payout_address?.startsWith('$')
    ? user.payout_address.slice(1, user.payout_address.length) + '@handcash.io'
    : user.payout_address?.indexOf('@') !== -1
    ? user.payout_address
    : null
}

const Node = (node: any) => {
  node = node['node']
  console.log('node', node)

  const isRoot = node.depth === 0
  const isParent = !!node.children

  if (isRoot) return <RootNode node={node} />

  const name = (paymail(node.data) ? paymail(node.data) : node.data.email)?.split('@')[0]
  return (
    <Group top={node.y} left={node.x}>
      {userPattern(node.data)}
      {node.depth !== 0 && (
        <circle
          r={20}
          fill={`url(#${node.data.payout_address})`}
          stroke={isParent ? merlinsbeard : citrus}
          onClick={() => {
            alert(`clicked: ${JSON.stringify(node.data, null, 2)}`)
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
        {name}
      </text>
    </Group>
  )
}

function RootNode(node: any) {
  const width = 80
  const height = 20
  const centerX = -width / 2
  const centerY = -height / 2
  const name = 'ROOT' // (paymail(node.data) ? paymail(node.data) : node.data.email)?.split('@')[0]
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
        {name}
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
    bottom: 40,
  },
}: {
  tree: any
  height: number
  width: number
  margin?: {
    top: number
    left: number
    right: number
    bottom: number
  }
}) => {
  const data = hierarchy(tree)
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  return (
    <svg width={width} height={height}>
      <LinearGradient id="top" from={aqua} to={merlinsbeard} />
      <rect width={width} height={height} fill={bg} />
      <Cluster root={data} size={[xMax, yMax]}>
        {(cluster) => {
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
                return node.data.hasOwnProperty('id') ? (
                  <Node key={`cluster-node-${i}`} node={node} />
                ) : null
              })}
            </Group>
          )
        }}
      </Cluster>
    </svg>
  )
}

const citrus = '#33B69E'
const white = '#ffffff'
const aqua = '#37ac8c'
const merlinsbeard = '#FF6E55'
const bg = '#111'
