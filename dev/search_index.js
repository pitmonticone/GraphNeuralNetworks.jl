var documenterSearchIndex = {"docs":
[{"location":"api/gnngraph/#Graphs","page":"GNNGraph","title":"Graphs","text":"","category":"section"},{"location":"api/gnngraph/","page":"GNNGraph","title":"GNNGraph","text":"Order = [:type, :function]\nPages   = [\"api/graphs.md\"]","category":"page"},{"location":"api/gnngraph/","page":"GNNGraph","title":"GNNGraph","text":"Modules = [GraphNeuralNetworks]\nPages   = [\"gnngraph.jl\"]\nPrivate = false","category":"page"},{"location":"api/gnngraph/#GraphNeuralNetworks.GNNGraph","page":"GNNGraph","title":"GraphNeuralNetworks.GNNGraph","text":"GNNGraph(data; [graph_type, ndata, edata, gdata, num_nodes, graph_indicator, dir])\nGNNGraph(g::GNNGraph; [ndata, edata, gdata])\n\nA type representing a graph structure and storing also  feature arrays associated to nodes, edges, and to the whole graph (global features). \n\nA GNNGraph can be constructed out of different objects data expressing the connections inside the graph. The internal representation type is determined by graph_type.\n\nWhen constructed from another GNNGraph, the internal graph representation is preserved and shared. The node/edge/global features are transmitted as well, unless explicitely changed though keyword arguments.\n\nA GNNGraph can also represent multiple graphs batched togheter  (see Flux.batch or SparseArrays.blockdiag). The field g.graph_indicator contains the graph membership of each node.\n\nA GNNGraph is a LightGraphs' AbstractGraph, therefore any functionality from the LightGraphs' graph library can be used on it.\n\nArguments\n\ndata: Some data representing the graph topology. Possible type are \nAn adjacency matrix\nAn adjacency list.\nA tuple containing the source and target vectors (COO representation)\nA LightGraphs' graph.\ngraph_type: A keyword argument that specifies                the underlying representation used by the GNNGraph.                Currently supported values are \n:coo. Graph represented as a tuple (source, target), such that the k-th edge          connects the node source[k] to node target[k].         Optionally, also edge weights can be given: (source, target, weights).\n:sparse. A sparse adjacency matrix representation.\n:dense. A dense adjacency matrix representation.  \nDefault :coo.\ndir. The assumed edge direction when given adjacency matrix or adjacency list input data g.        Possible values are :out and :in. Default :out.\nnum_nodes. The number of nodes. If not specified, inferred from g. Default nothing.\ngraph_indicator. For batched graphs, a vector containing the graph assigment of each node. Default nothing.  \nndata: Node features. A named tuple of arrays whose last dimension has size num_nodes.\nedata: Edge features. A named tuple of arrays whose whose last dimension has size num_edges.\ngdata: Global features. A named tuple of arrays whose has size num_graphs. \n\nUsage.\n\nusing Flux, GraphNeuralNetworks\n\n# Construct from adjacency list representation\ndata = [[2,3], [1,4,5], [1], [2,5], [2,4]]\ng = GNNGraph(data)\n\n# Number of nodes, edges, and batched graphs\ng.num_nodes  # 5\ng.num_edges  # 10 \ng.num_graphs # 1 \n\n# Same graph in COO representation\ns = [1,1,2,2,2,3,4,4,5,5]\nt = [2,3,1,4,5,3,2,5,2,4]\ng = GNNGraph(s, t)\n\n# From a LightGraphs' graph\ng = GNNGraph(erdos_renyi(100, 20))\n\n# Add 2 node feature arrays\ng = GNNGraph(g, ndata = (X = rand(100, g.num_nodes), y = rand(g.num_nodes)))\n\n# Add node features and edge features with default names `X` and `E` \ng = GNNGraph(g, ndata = rand(100, g.num_nodes), edata = rand(16, g.num_edges))\n\ng.ndata.X\ng.ndata.E\n\n# Send to gpu\ng = g |> gpu\n\n# Collect edges' source and target nodes.\n# Both source and target are vectors of length num_edges\nsource, target = edge_index(g)\n\n\n\n\n\n","category":"type"},{"location":"api/gnngraph/#GraphNeuralNetworks.add_self_loops-Tuple{GNNGraph{var\"#s15\"} where var\"#s15\"<:(Tuple{T, T, V} where {T<:(AbstractVector{T} where T), V})}","page":"GNNGraph","title":"GraphNeuralNetworks.add_self_loops","text":"add_self_loops(g::GNNGraph)\n\nReturn a graph with the same features as g but also adding edges connecting the nodes to themselves.\n\nNodes with already existing self-loops will obtain a second self-loop.\n\n\n\n\n\n","category":"method"},{"location":"api/gnngraph/#GraphNeuralNetworks.edge_index-Tuple{GNNGraph{var\"#s16\"} where var\"#s16\"<:(Tuple{T, T, V} where {T<:(AbstractVector{T} where T), V})}","page":"GNNGraph","title":"GraphNeuralNetworks.edge_index","text":"edge_index(g::GNNGraph)\n\nReturn a tuple containing two vectors, respectively storing  the source and target nodes for each edges in g.\n\ns, t = edge_index(g)\n\n\n\n\n\n","category":"method"},{"location":"api/gnngraph/#GraphNeuralNetworks.normalized_laplacian","page":"GNNGraph","title":"GraphNeuralNetworks.normalized_laplacian","text":"normalized_laplacian(g, T=Float32; add_self_loops=false, dir=:out)\n\nNormalized Laplacian matrix of graph g.\n\nArguments\n\ng: A GNNGraph.\nT: result element type.\nadd_self_loops: add self-loops while calculating the matrix.\ndir: the edge directionality considered (:out, :in, :both).\n\n\n\n\n\n","category":"function"},{"location":"api/gnngraph/#GraphNeuralNetworks.scaled_laplacian","page":"GNNGraph","title":"GraphNeuralNetworks.scaled_laplacian","text":"scaled_laplacian(g, T=Float32; dir=:out)\n\nScaled Laplacian matrix of graph g, defined as hatL = frac2lambda_max L - I where L is the normalized Laplacian matrix.\n\nArguments\n\ng: A GNNGraph.\nT: result element type.\ndir: the edge directionality considered (:out, :in, :both).\n\n\n\n\n\n","category":"function"},{"location":"api/gnngraph/#GraphNeuralNetworks.subgraph-Tuple{GNNGraph, Int64}","page":"GNNGraph","title":"GraphNeuralNetworks.subgraph","text":"subgraph(g::GNNGraph, i)\n\nReturn the subgraph of g induced by those nodes v for which g.graph_indicator[v] ∈ i. In other words, it extract the component graphs from a batched graph. \n\nIt also returns a vector nodes mapping the new nodes to the old ones.  The node i in the subgraph corresponds to the node nodes[i] in g.\n\n\n\n\n\n","category":"method"},{"location":"dev/#Developer-Notes","page":"Developer Notes","title":"Developer Notes","text":"","category":"section"},{"location":"dev/#Benchmarking","page":"Developer Notes","title":"Benchmarking","text":"","category":"section"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"You can benchmark the effect on performance of your commits using the script perf/perf.jl.","category":"page"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"First, checkout and benchmark the master branch:","category":"page"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"julia> include(\"perf.jl\")\n\njulia> df = run_benchmarks()\n\n# observe results\njulia> for g in groupby(df, :layer); println(g, \"\\n\"); end\n\njulia> @save \"perf_master_20210803_mymachine.jld2\" dfmaster=df","category":"page"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"Now checkout your branch and do the same:","category":"page"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"julia> df = run_benchmarks()\n\njulia> @save \"perf_pr_20210803_mymachine.jld2\" dfpr=df","category":"page"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"Finally, compare the results:","category":"page"},{"location":"dev/","page":"Developer Notes","title":"Developer Notes","text":"julia> @load \"perf_master_20210803_mymachine.jld2\"\n\njulia> @load \"perf_pr_20210803_mymachine.jld2\"\n\njulia> compare(dfpr, dfmaster)","category":"page"},{"location":"gnngraph/#Graphs","page":"GNNGraph","title":"Graphs","text":"","category":"section"},{"location":"gnngraph/","page":"GNNGraph","title":"GNNGraph","text":"TODO","category":"page"},{"location":"gnngraph/","page":"GNNGraph","title":"GNNGraph","text":"GNNGraph","category":"page"},{"location":"models/#Models","page":"Model Building","title":"Models","text":"","category":"section"},{"location":"models/","page":"Model Building","title":"Model Building","text":"GraphNeuralNetworks.jl provides common graph convolutional layers by which you can assemble arbitrarily deep or complex models. GNN layers are compatible with  Flux.jl ones, therefore expert Flux's users should be immediately able to define and train  their models. ","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"In what follows, we discuss two different styles for model creation: the explicit modeling style, more verbose but more flexible,  and the implicit modeling style based on GNNChain, more concise but less flexible.","category":"page"},{"location":"models/#Explicit-modeling","page":"Model Building","title":"Explicit modeling","text":"","category":"section"},{"location":"models/","page":"Model Building","title":"Model Building","text":"In the explicit modeling style, the model is created according to the following steps:","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"Define a new type for your model (GNN in the example below). Layers and submodels are fields.\nApply Flux.@functor to the new type to make it Flux's compatible (parameters' collection, gpu movement, etc...)\nOptionally define a convenience constructor for your model.\nDefine the forward pass by implementing the function call method for your type\nInstantiate the model. ","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"Here is an example of this construction:","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"using Flux, LightGraphs, GraphNeuralNetworks\nusing Flux: @functor\n\nstruct GNN                                # step 1\n    conv1\n    bn\n    conv2\n    dropout\n    dense\nend\n\n@functor GNN                              # step 2\n\nfunction GNN(din::Int, d::Int, dout::Int) # step 3    \n    GNN(GCNConv(din => d),\n        BatchNorm(d),\n        GraphConv(d => d, relu),\n        Dropout(0.5),\n        Dense(d, dout))\nend\n\nfunction (model::GNN)(g::GNNGraph, x)     # step 4\n    x = model.conv1(g, x)\n    x = relu.(model.bn(x))\n    x = model.conv2(g, x)\n    x = model.dropout(x)\n    x = model.dense(x)\n    return x \nend\n\ndin, d, dout = 3, 4, 2 \ng = GNNGraph(random_regular_graph(10, 4))\nX = randn(Float32, din, 10)\nmodel = GNN(din, d, dout)                 # step 5\ny = model(g, X)","category":"page"},{"location":"models/#Implicit-modeling-with-GNNChains","page":"Model Building","title":"Implicit modeling with GNNChains","text":"","category":"section"},{"location":"models/","page":"Model Building","title":"Model Building","text":"While very flexible, the way in which we defined GNN model definition in last section is a bit verbose. In order to simplify things, we provide the GNNChain type. It is very similar  to Flux's well known Chain. It allows to compose layers in a sequential fashion as Chain does, propagating the output of each layer to the next one. In addition, GNNChain  handles propagates the input graph as well, providing it as a first argument to layers subtyping the GNNLayer abstract type. ","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"Using GNNChain, the previous example becomes","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"using Flux, LightGraphs, GraphNeuralNetworks\n\ndin, d, dout = 3, 4, 2 \ng = GNNGraph(random_regular_graph(10, 4))\nX = randn(Float32, din, 10)\n\nmodel = GNNChain(GCNConv(din => d),\n                 BatchNorm(d),\n                 x -> relu.(x),\n                 GraphConv(d => d, relu),\n                 Dropout(0.5),\n                 Dense(d, dout))\n\ny = model(g, X)","category":"page"},{"location":"models/","page":"Model Building","title":"Model Building","text":"The GNNChain only propagates the graph and the node features. More complex scenarios, e.g. when also edge features are updated, have to be handled using the explicit definition of the forward pass. ","category":"page"},{"location":"api/pool/#Pooling-Layers","page":"Pooling Layers","title":"Pooling Layers","text":"","category":"section"},{"location":"api/pool/","page":"Pooling Layers","title":"Pooling Layers","text":"Order = [:type, :function]\nPages   = [\"api/pool.md\"]","category":"page"},{"location":"api/pool/","page":"Pooling Layers","title":"Pooling Layers","text":"Modules = [GraphNeuralNetworks]\nPages   = [\"layers/pool.jl\"]\nPrivate = false","category":"page"},{"location":"api/pool/#GraphNeuralNetworks.GlobalPool","page":"Pooling Layers","title":"GraphNeuralNetworks.GlobalPool","text":"GlobalPool(aggr)\n\nGlobal pooling layer for graph neural networks. Takes a graph and feature nodes as inputs and performs the operation\n\nmathbfu_V = box_i in V mathbfx_i\n\nwhere V is the set of nodes of the input graph and \nthe type of aggregation represented by box is selected by the aggr argument \nCommonly used aggregations are are mean max and +\n\n\njulia using GraphNeuralNetworks, LightGraphs\n\npool = GlobalPool(mean)\n\ng = GNNGraph(randomregulargraph(10, 4)) X = rand(32, 10) pool(g, X) # => 32x1 matrix ```\n\n\n\n\n\n","category":"type"},{"location":"api/pool/#GraphNeuralNetworks.TopKPool","page":"Pooling Layers","title":"GraphNeuralNetworks.TopKPool","text":"TopKPool(adj, k, in_channel)\n\nTop-k pooling layer.\n\nArguments\n\nadj: Adjacency matrix  of a graph.\nk: Top-k nodes are selected to pool together.\nin_channel: The dimension of input channel.\n\n\n\n\n\n","category":"type"},{"location":"messagepassing/#Message-Passing","page":"Message Passing","title":"Message Passing","text":"","category":"section"},{"location":"messagepassing/","page":"Message Passing","title":"Message Passing","text":"TODO","category":"page"},{"location":"messagepassing/","page":"Message Passing","title":"Message Passing","text":"propagate","category":"page"},{"location":"api/basic/#Basic-Layers","page":"Basic Layers","title":"Basic Layers","text":"","category":"section"},{"location":"api/basic/","page":"Basic Layers","title":"Basic Layers","text":"Order = [:type, :function]\nPages   = [\"api/basics.md\"]","category":"page"},{"location":"api/basic/","page":"Basic Layers","title":"Basic Layers","text":"Modules = [GraphNeuralNetworks]\nPages   = [\"layers/basic.jl\"]\nPrivate = false","category":"page"},{"location":"api/basic/#GraphNeuralNetworks.GNNChain","page":"Basic Layers","title":"GraphNeuralNetworks.GNNChain","text":"GNNChain(layers...)\nGNNChain(name = layer, ...)\n\nCollects multiple layers / functions to be called in sequence on given input graph and input node features. \n\nIt allows to compose layers in a sequential fashion as Flux.Chain does, propagating the output of each layer to the next one. In addition, GNNChain handles the input graph as well, providing it  as a first argument only to layers subtyping the GNNLayer abstract type. \n\nGNNChain supports indexing and slicing, m[2] or m[1:end-1], and if names are given, m[:name] == m[1] etc.\n\nExamples\n\njulia> m = GNNChain(GCNConv(2=>5), BatchNorm(5), x -> relu.(x), Dense(5, 4));\n\njulia> x = randn(Float32, 2, 3);\n\njulia> g = GNNGraph([1,1,2,3], [2,3,1,1]);\n\njulia> m(g, x)\n4×3 Matrix{Float32}:\n  0.157941    0.15443     0.193471\n  0.0819516   0.0503105   0.122523\n  0.225933    0.267901    0.241878\n -0.0134364  -0.0120716  -0.0172505\n\n\n\n\n\n","category":"type"},{"location":"api/basic/#GraphNeuralNetworks.GNNLayer","page":"Basic Layers","title":"GraphNeuralNetworks.GNNLayer","text":"abstract type GNNLayer end\n\nAn abstract type from which graph neural network layers are derived.\n\nSee also GNNChain.\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#Convolutional-Layers","page":"Convolutional Layers","title":"Convolutional Layers","text":"","category":"section"},{"location":"api/conv/","page":"Convolutional Layers","title":"Convolutional Layers","text":"Order = [:type, :function]\nPages   = [\"api/conv.md\"]","category":"page"},{"location":"api/conv/","page":"Convolutional Layers","title":"Convolutional Layers","text":"Modules = [GraphNeuralNetworks]\nPages   = [\"layers/conv.jl\"]\nPrivate = false","category":"page"},{"location":"api/conv/#GraphNeuralNetworks.ChebConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.ChebConv","text":"ChebConv(in=>out, k; bias=true, init=glorot_uniform)\n\nChebyshev spectral graph convolutional layer from paper Convolutional Neural Networks on Graphs with Fast Localized Spectral Filtering.\n\nImplements\n\nX = sum^K-1_k=0  W^(k) Z^(k)\n\nwhere Z^(k) is the k-th term of Chebyshev polynomials, and can be calculated by the following recursive form:\n\nZ^(0) = X \nZ^(1) = hatL X \nZ^(k) = 2 hatL Z^(k-1) - Z^(k-2)\n\nwith hatL the scaled_laplacian.\n\nArguments\n\nin: The dimension of input features.\nout: The dimension of output features.\nk: The order of Chebyshev polynomial.\nbias: Add learnable bias.\ninit: Weights' initializer.\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#GraphNeuralNetworks.EdgeConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.EdgeConv","text":"EdgeConv(f; aggr=max)\n\nEdge convolutional layer from paper Dynamic Graph CNN for Learning on Point Clouds.\n\nPerforms the operation\n\nmathbfx_i = square_j in N(i) f(mathbfx_i  mathbfx_j - mathbfx_i)\n\nwhere f typically denotes a learnable function, e.g. a linear layer or a multi-layer perceptron.\n\nArguments\n\nf: A (possibly learnable) function acting on edge features. \naggr: Aggregation operator for the incoming messages (e.g. +, *, max, min, and mean).\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#GraphNeuralNetworks.GATConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.GATConv","text":"GATConv(in => out;\n        heads=1,\n        concat=true,\n        init=glorot_uniform    \n        bias=true, \n        negative_slope=0.2f0)\n\nGraph attentional layer from the paper Graph Attention Networks.\n\nImplements the operation\n\nmathbfx_i = sum_j in N(i) alpha_ij W mathbfx_j\n\nwhere the attention coefficient alpha_ij is given by\n\nalpha_ij = frac1z_i exp(LeakyReLU(mathbfa^T W mathbfx_i  W mathbfx_j))\n\nwith z_i a normalization factor.\n\nArguments\n\nin: The dimension of input features.\nout: The dimension of output features.\nbias::Bool: Keyword argument, whether to learn the additive bias.\nheads: Number attention heads \nconcat: Concatenate layer output or not. If not, layer output is averaged over the heads.\nnegative_slope::Real: Keyword argument, the parameter of LeakyReLU.\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#GraphNeuralNetworks.GCNConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.GCNConv","text":"GCNConv(in => out, σ=identity; bias=true, init=glorot_uniform)\n\nGraph convolutional layer from paper Semi-supervised Classification with Graph Convolutional Networks.\n\nPerforms the operation\n\nmathbfx_i = sum_jin N(i) frac1c_ij W mathbfx_j\n\nwhere c_ij = sqrtN(i)N(j).\n\nThe input to the layer is a node feature array X  of size (num_features, num_nodes).\n\nArguments\n\nin: Number of input features.\nout: Number of output features.\nσ: Activation function.\nbias: Add learnable bias.\ninit: Weights' initializer.\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#GraphNeuralNetworks.GINConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.GINConv","text":"GINConv(f; eps = 0f0)\n\nGraph Isomorphism convolutional layer from paper How Powerful are Graph Neural Networks?\n\nmathbfx_i = fleft((1 + epsilon) mathbfx_i + sum_j in N(i) mathbfx_j right)\n\nwhere f typically denotes a learnable function, e.g. a linear layer or a multi-layer perceptron.\n\nArguments\n\nf: A (possibly learnable) function acting on node features. \neps: Weighting factor.\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#GraphNeuralNetworks.GatedGraphConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.GatedGraphConv","text":"GatedGraphConv(out, num_layers; aggr=+, init=glorot_uniform)\n\nGated graph convolution layer from Gated Graph Sequence Neural Networks.\n\nImplements the recursion\n\nmathbfh^(0)_i = mathbfx_i  mathbf0 \nmathbfh^(l)_i = GRU(mathbfh^(l-1)_i square_j in N(i) W mathbfh^(l-1)_j)\n\nwhere mathbfh^(l)_i denotes the l-th hidden variables passing through GRU. The dimension of input mathbfx_i needs to be less or equal to out.\n\nArguments\n\nout: The dimension of output features.\nnum_layers: The number of gated recurrent unit.\naggr: Aggregation operator for the incoming messages (e.g. +, *, max, min, and mean).\ninit: Weight initialization function.\n\n\n\n\n\n","category":"type"},{"location":"api/conv/#GraphNeuralNetworks.GraphConv","page":"Convolutional Layers","title":"GraphNeuralNetworks.GraphConv","text":"GraphConv(in => out, σ=identity, aggr=+; bias=true, init=glorot_uniform)\n\nGraph convolution layer from Reference: Weisfeiler and Leman Go Neural: Higher-order Graph Neural Networks.\n\nPerforms:\n\nmathbfx_i = W^1 mathbfx_i + square_j in mathcalN(i) W^2 mathbfx_j)\n\nwhere the aggregation type is selected by aggr.\n\nArguments\n\nin: The dimension of input features.\nout: The dimension of output features.\nσ: Activation function.\naggr: Aggregation operator for the incoming messages (e.g. +, *, max, min, and mean).\nbias: Add learnable bias.\ninit: Weights' initializer.\n\n\n\n\n\n","category":"type"},{"location":"api/messagepassing/#Message-Passing","page":"Message Passing","title":"Message Passing","text":"","category":"section"},{"location":"api/messagepassing/","page":"Message Passing","title":"Message Passing","text":"GraphNeuralNetworks.message\nGraphNeuralNetworks.update\nGraphNeuralNetworks.propagate","category":"page"},{"location":"api/messagepassing/#GraphNeuralNetworks.message","page":"Message Passing","title":"GraphNeuralNetworks.message","text":"message(mp, x_i, x_j, [e_ij, u])\n\nMessage function for the message-passing scheme, returning the message from node j to node i . In the message-passing scheme. the incoming messages  from the neighborhood of i will later be aggregated in order to update the features of node i.\n\nBy default, the function returns x_j. Custom layer should specialize this method with the desired behavior.\n\nArguments\n\nmp: A gnn layer.\nx_i: Features of the central node i.\nx_j: Features of the neighbor j of node i.\ne_ij: Features of edge (i, j).\nu: Global features.\n\nSee also update and propagate.\n\n\n\n\n\n","category":"function"},{"location":"api/messagepassing/#GraphNeuralNetworks.update","page":"Message Passing","title":"GraphNeuralNetworks.update","text":"update(mp, m̄, x, [u])\n\nUpdate function for the message-passing scheme, returning a new set of node features x′ based on old  features x and the incoming message from the neighborhood aggregation m̄.\n\nBy default, the function returns m̄. Custom layers should  specialize this method with the desired behavior.\n\nArguments\n\nmp: A gnn layer.\nm̄: Aggregated edge messages from the message function.\nx: Node features to be updated.\nu: Global features.\n\nSee also message and propagate.\n\n\n\n\n\n","category":"function"},{"location":"api/messagepassing/#GraphNeuralNetworks.propagate","page":"Message Passing","title":"GraphNeuralNetworks.propagate","text":"propagate(mp, g::GNNGraph, aggr)\npropagate(mp, g::GNNGraph, E, X, u, aggr)\n\nPerform the sequence of operation implementing the message-passing scheme and updating node, edge, and global features X, E, and u respectively.\n\nThe computation involved is the following:\n\nM = compute_batch_message(mp, g, E, X, u) \nE = update_edge(mp, M, E, u)\nM̄ = aggregate_neighbors(mp, aggr, g, M)\nX = update(mp, M̄, X, u)\nu = update_global(mp, E, X, u)\n\nCustom layers typically define their own update and message function, then call this method in the forward pass:\n\nfunction (l::MyLayer)(g, X)\n    ... some prepocessing if needed ...\n    E = nothing\n    u = nothing\n    propagate(l, g, E, X, u, +)\nend\n\nSee also message and update.\n\n\n\n\n\n","category":"function"},{"location":"api/nnlib/#NNlib","page":"NNlib","title":"NNlib","text":"","category":"section"},{"location":"api/nnlib/","page":"NNlib","title":"NNlib","text":"Primitive functions implemented in NNlib.jl.","category":"page"},{"location":"api/nnlib/","page":"NNlib","title":"NNlib","text":"NNlib.gather!\nNNlib.gather\nNNlib.scatter!\nNNlib.scatter","category":"page"},{"location":"#GraphNeuralNetworks","page":"Home","title":"GraphNeuralNetworks","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Documentation for GraphNeuralNetworks.","category":"page"},{"location":"#Getting-Started","page":"Home","title":"Getting Started","text":"","category":"section"}]
}
