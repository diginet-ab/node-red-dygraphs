# node-red-dygraphs
Graphs for node-red's dashboard UI using dygraphs.

## WARNING: this is a very rough prototype!

## Nodes

### Dygraph

The dygraph node is a would-be dashboard UI node to display a graph that is implemented as
a standard node that pushes the right magic into a template node. In other words, the
dygraph node is intended to always be coupled with a UI template node.

The dygraph node understands several input messages. The standard message to add a live data
point contains:
- msg.at:      seconds since epoch, microsec since epoch, Date object, or null (for `Date.now()`)
- msg.payload: numerical value or NaN/null for missing value, or 3-value array with avg, min, max
- msg.topic:   name of series

(Not yet implemented:) In order to initialize the node with historical data a message with an array of data points
can be piped in:
- msg.payload: array of data points, each point being an object with ...

The various options of dygraphs can be controlled by passing an options field in:
- msg.options: object with dygraph options (forwarded as-is, i.e., see dygraphs documentation)

### Resample (not implemented)

The purpose of the resample node is to align the data points of multiple series in order to
improve the on-hove display of values and to allow stacking. The assumption here is that
various measurements come in at arbitrary times and the resample node aligns them at regular
intervals using linear interpolation between sample points.

When there are multiple data points within one resampled interval the resample node can optionally
produce min/max values resulting in a shaded range around the point in dygraphs.

### Rate (not implemented)

The rate node converts a counter into a rate suitable to pipe to dygraphs. The input to
the rate node is the same as that of the dygraph node except that it interprets values
as monotonically increasing counters and converts the delta between two data points to a
per-second rate, which it outputs.


