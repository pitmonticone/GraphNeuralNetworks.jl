"""
    propagate(l, g, aggr; xi, xj, e)  ->  m̄, m

Performs the message-passing for GNN layer `l` on graph `g` . 
Returns updated node and edge features `x` and `e`.

In case no input and edge features are given as input, 
extracts them from `g` and returns the same graph
with updated feautres.

The computational steps are the following:

```julia
m = apply_edges(l, g, xi, xj, e)  # calls `compute_message`
m̄ = aggregate_neighbors(g, aggr, m)
```

Custom layers typically define their own [`compute_message`](@ref) function, then call
this method in the forward pass:

# Usage example

```julia
using GraphNeuralNetworks, Flux

struct GNNConv <: GNNLayer
    W
    b
    σ
end

Flux.@functor GNNConv

function GNNConv(ch::Pair{Int,Int}, σ=identity)
    in, out = ch
    W = Flux.glorot_uniform(out, in)
    b = zeros(Float32, out)
    GNNConv(W, b, σ, aggr)
end

compute_message(l::GNNConv, xi, xj, eij) = l.W * xj

function (l::GNNConv)(g::GNNGraph, x::AbstractMatrix)
    m̄ = propagate(l, g, +, xj=x)
    return l.σ.(m̄ .+ l.bias)
end

l = GNNConv(10 => 20)
l(g, x)
```

See also [`compute_message`](@ref) and [`update_node`](@ref).
"""
function propagate end 

propagate(l, g::GNNGraph, aggr; xi=nothing, xj=nothing, e=nothing) = 
    propagate(l, g, aggr, xi, xj, e)

function propagate(l, g::GNNGraph, aggr, xi, xj, e)
    m = apply_edges(l, g, xi, xj, e) 
    m̄ = aggregate_neighbors(g, aggr, m)
    return m̄
end

## Step 1.

"""
    compute_message(l, x_i, x_j, [e_ij])

Message function for the message-passing scheme
started by [`propagate`](@ref).
Returns the message from node `j` to node `i` .
In the message-passing scheme, the incoming messages 
from the neighborhood of `i` will later be aggregated
in order to update (see [`update_node`](@ref)) the features of node `i`.

The function operates on batches of edges, therefore
`x_i`, `x_j`, and `e_ij` are tensors whose last dimension
is the batch size, or can be tuple/namedtuples of 
such tensors, according to the input to propagate.

By default, the function returns `x_j`.
Custom layer should specialize this method with the desired behavior.

# Arguments

- `l`: A gnn layer.
- `x_i`: Features of the central node `i`.
- `x_j`: Features of the neighbor `j` of node `i`.
- `e_ij`: Features of edge `(i,j)`.

See also [`update_node`](@ref) and [`propagate`](@ref).
"""
function compute_message end 

compute_message(l, x_i, x_j, e_ij) = compute_message(l, x_i, x_j)

_gather(x::NamedTuple, i) = map(x -> _gather(x, i), x)
_gather(x::Tuple, i) = map(x -> _gather(x, i), x)
_gather(x::AbstractArray, i) = NNlib.gather(x, i)
_gather(x::Nothing, i) = nothing

apply_edges(l, g::GNNGraph; xi=nothing, xj=nothing, e=nothing) = 
    apply_edges(l, g, xi, xj, e)

apply_edges(l::GNNLayer, g::GNNGraph, xi, xj, e) = 
    apply_edges((xi,xj,e) -> compute_message(l, xi, xj, e), g, xi, xj, e)

function apply_edges(f, g::GNNGraph, xi, xj, e)
    s, t = edge_index(g)
    xi = _gather(xi, t)   # size: (D, num_nodes) -> (D, num_edges)
    xj = _gather(xj, s)
    m = f(xi, xj, e)
    return m
end


##  Step 2

_scatter(aggr, m::NamedTuple, t) = map(m -> _scatter(aggr, m, t), m)
_scatter(aggr, m::Tuple, t) = map(m -> _scatter(aggr, m, t), m)
_scatter(aggr, m::AbstractArray, t) = NNlib.scatter(aggr, m, t)

function aggregate_neighbors(g::GNNGraph, aggr, m)
    s, t = edge_index(g)
    return _scatter(aggr, m, t)
end

aggregate_neighbors(g::GNNGraph, aggr::Nothing, e) = nothing

### end steps ###



### SPECIALIZATIONS OF PROPAGATE ###
copyxi(xi, xj, e) = xi
copyxj(xi, xj, e) = xj
ximulxj(xi, xj, e) = xi .* xj
xiaddxj(xi, xj, e) = xi .+ xj

function propagate(::typeof(copyxj), g::GNNGraph, ::typeof(+), xi, xj, e)
    A = adjacency_matrix(g)
    return xj * A
end

# TODO divide  by degre
# propagate(::typeof(copyxj), g::GNNGraph, ::typeof(mean), xi, xj, e)

