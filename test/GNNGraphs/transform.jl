@testset "add self-loops" begin
    A = [1 1 0 0
         0 0 1 0
         0 0 0 1
         1 0 0 0]
    A2 = [2 1 0 0
          0 1 1 0
          0 0 1 1
          1 0 0 1]

    g = GNNGraph(A; graph_type = GRAPH_T)
    fg2 = add_self_loops(g)
    @test adjacency_matrix(g) == A
    @test g.num_edges == sum(A)
    @test adjacency_matrix(fg2) == A2
    @test fg2.num_edges == sum(A2)
end

@testset "batch" begin
    g1 = GNNGraph(random_regular_graph(10, 2), ndata = rand(16, 10),
                  graph_type = GRAPH_T)
    g2 = GNNGraph(random_regular_graph(4, 2), ndata = rand(16, 4), graph_type = GRAPH_T)
    g3 = GNNGraph(random_regular_graph(7, 2), ndata = rand(16, 7), graph_type = GRAPH_T)

    g12 = Flux.batch([g1, g2])
    g12b = blockdiag(g1, g2)
    @test g12 == g12b

    g123 = Flux.batch([g1, g2, g3])
    @test g123.graph_indicator == [fill(1, 10); fill(2, 4); fill(3, 7)]

    s, t = edge_index(g123)
    @test s == [edge_index(g1)[1]; 10 .+ edge_index(g2)[1]; 14 .+ edge_index(g3)[1]]
    @test t == [edge_index(g1)[2]; 10 .+ edge_index(g2)[2]; 14 .+ edge_index(g3)[2]]
    @test node_features(g123)[:, 11:14] ≈ node_features(g2)

    # scalar graph features
    g1 = GNNGraph(g1, gdata = rand())
    g2 = GNNGraph(g2, gdata = rand())
    g3 = GNNGraph(g3, gdata = rand())
    g123 = Flux.batch([g1, g2, g3])
    @test g123.gdata.u == [g1.gdata.u, g2.gdata.u, g3.gdata.u]

    # Batch of batches
    g123123 = Flux.batch([g123, g123])
    @test g123123.graph_indicator ==
          [fill(1, 10); fill(2, 4); fill(3, 7); fill(4, 10); fill(5, 4); fill(6, 7)]
    @test g123123.num_graphs == 6
end

@testset "unbatch" begin
    g1 = rand_graph(10, 20, graph_type = GRAPH_T)
    g2 = rand_graph(5, 10, graph_type = GRAPH_T)
    g12 = Flux.batch([g1, g2])
    gs = Flux.unbatch([g1, g2])
    @test length(gs) == 2
    @test gs[1].num_nodes == 10
    @test gs[1].num_edges == 20
    @test gs[1].num_graphs == 1
    @test gs[2].num_nodes == 5
    @test gs[2].num_edges == 10
    @test gs[2].num_graphs == 1
end

@testset "batch/unbatch roundtrip" begin
    n = 20
    c = 3
    ngraphs = 10
    gs = [rand_graph(n, c * n, ndata = rand(2, n), edata = rand(3, c * n),
                     graph_type = GRAPH_T)
          for _ in 1:ngraphs]
    gall = Flux.batch(gs)
    gs2 = Flux.unbatch(gall)
    @test gs2[1] == gs[1]
    @test gs2[end] == gs[end]
end

@testset "getgraph" begin
    g1 = GNNGraph(random_regular_graph(10, 2), ndata = rand(16, 10),
                  graph_type = GRAPH_T)
    g2 = GNNGraph(random_regular_graph(4, 2), ndata = rand(16, 4), graph_type = GRAPH_T)
    g3 = GNNGraph(random_regular_graph(7, 2), ndata = rand(16, 7), graph_type = GRAPH_T)
    g = Flux.batch([g1, g2, g3])

    g2b, nodemap = getgraph(g, 2, nmap = true)
    s, t = edge_index(g2b)
    @test s == edge_index(g2)[1]
    @test t == edge_index(g2)[2]
    @test node_features(g2b) ≈ node_features(g2)

    g2c = getgraph(g, 2)
    @test g2c isa GNNGraph{typeof(g.graph)}

    g1b, nodemap = getgraph(g1, 1, nmap = true)
    @test g1b === g1
    @test nodemap == 1:(g1.num_nodes)
end

@testset "add_edges" begin if GRAPH_T == :coo
    s = [1, 1, 2, 3]
    t = [2, 3, 4, 5]
    g = GNNGraph(s, t, graph_type = GRAPH_T)
    snew = [1]
    tnew = [4]
    gnew = add_edges(g, snew, tnew)
    @test gnew.num_edges == 5
    @test sort(inneighbors(gnew, 4)) == [1, 2]

    g = GNNGraph(s, t, edata = (e1 = rand(2, 4), e2 = rand(3, 4)), graph_type = GRAPH_T)
    # @test_throws ErrorException add_edges(g, snew, tnew)
    gnew = add_edges(g, snew, tnew, edata = (e1 = ones(2, 1), e2 = zeros(3, 1)))
    @test all(gnew.edata.e1[:, 5] .== 1)
    @test all(gnew.edata.e2[:, 5] .== 0)
end end

@testset "add_nodes" begin if GRAPH_T == :coo
    g = rand_graph(6, 4, ndata = rand(2, 6), graph_type = GRAPH_T)
    gnew = add_nodes(g, 5, ndata = ones(2, 5))
    @test gnew.num_nodes == g.num_nodes + 5
    @test gnew.num_edges == g.num_edges
    @test gnew.num_graphs == g.num_graphs
    @test all(gnew.ndata.x[:, 7:11] .== 1)
end end

@testset "remove_self_loops" begin if GRAPH_T == :coo # add_edges and set_edge_weight only implemented for coo
    g = rand_graph(10, 20, graph_type = GRAPH_T)
    g1 = add_edges(g, [1:5;], [1:5;])
    @test g1.num_edges == g.num_edges + 5
    g2 = remove_self_loops(g1)
    @test g2.num_edges == g.num_edges
    @test sort_edge_index(edge_index(g2)) == sort_edge_index(edge_index(g))

    # with edge features and weights
    g1 = GNNGraph(g1, edata = (e1 = ones(3, g1.num_edges), e2 = 2 * ones(g1.num_edges)))
    g1 = set_edge_weight(g1, 3 * ones(g1.num_edges))
    g2 = remove_self_loops(g1)
    @test g2.num_edges == g.num_edges
    @test sort_edge_index(edge_index(g2)) == sort_edge_index(edge_index(g))
    @test size(get_edge_weight(g2)) == (g2.num_edges,)
    @test size(g2.edata.e1) == (3, g2.num_edges)
    @test size(g2.edata.e2) == (g2.num_edges,)
end end

@testset "remove_multi_edges" begin if GRAPH_T == :coo
    g = rand_graph(10, 20, graph_type = GRAPH_T)
    s, t = edge_index(g)
    g1 = add_edges(g, s[1:5], t[1:5])
    @test g1.num_edges == g.num_edges + 5
    g2 = remove_multi_edges(g1, aggr = +)
    @test g2.num_edges == g.num_edges
    @test sort_edge_index(edge_index(g2)) == sort_edge_index(edge_index(g))

    # Default aggregation is +
    g1 = GNNGraph(g1, edata = (e1 = ones(3, g1.num_edges), e2 = 2 * ones(g1.num_edges)))
    g1 = set_edge_weight(g1, 3 * ones(g1.num_edges))
    g2 = remove_multi_edges(g1)
    @test g2.num_edges == g.num_edges
    @test sort_edge_index(edge_index(g2)) == sort_edge_index(edge_index(g))
    @test count(g2.edata.e1[:, i] == 2 * ones(3) for i in 1:(g2.num_edges)) == 5
    @test count(g2.edata.e2[i] == 4 for i in 1:(g2.num_edges)) == 5
    w2 = get_edge_weight(g2)
    @test count(w2[i] == 6 for i in 1:(g2.num_edges)) == 5
end end

@testset "negative_sample" begin if GRAPH_T == :coo
    n, m = 10, 30
    g = rand_graph(n, m, bidirected = true, graph_type = GRAPH_T)

    # check bidirected=is_bidirected(g) default
    gneg = negative_sample(g, num_neg_edges = 20)
    @test gneg.num_nodes == g.num_nodes
    @test gneg.num_edges == 20
    @test is_bidirected(gneg)
    @test intersect(g, gneg).num_edges == 0
end end

@testset "rand_edge_split" begin if GRAPH_T == :coo
    n, m = 100, 300

    g = rand_graph(n, m, bidirected = true, graph_type = GRAPH_T)
    # check bidirected=is_bidirected(g) default
    g1, g2 = rand_edge_split(g, 0.9)
    @test is_bidirected(g1)
    @test is_bidirected(g2)
    @test intersect(g1, g2).num_edges == 0
    @test g1.num_edges + g2.num_edges == g.num_edges
    @test g2.num_edges < 50

    g = rand_graph(n, m, bidirected = false, graph_type = GRAPH_T)
    # check bidirected=is_bidirected(g) default
    g1, g2 = rand_edge_split(g, 0.9)
    @test !is_bidirected(g1)
    @test !is_bidirected(g2)
    @test intersect(g1, g2).num_edges == 0
    @test g1.num_edges + g2.num_edges == g.num_edges
    @test g2.num_edges < 50

    g1, g2 = rand_edge_split(g, 0.9, bidirected = false)
    @test !is_bidirected(g1)
    @test !is_bidirected(g2)
    @test intersect(g1, g2).num_edges == 0
    @test g1.num_edges + g2.num_edges == g.num_edges
    @test g2.num_edges < 50
end end

@testset "set_edge_weight" begin
    g = rand_graph(10, 20, graph_type = GRAPH_T)
    w = rand(20)

    gw = set_edge_weight(g, w)
    @test get_edge_weight(gw) == w

    # now from weighted graph
    s, t = edge_index(g)
    g2 = GNNGraph(s, t, rand(20), graph_type = GRAPH_T)
    gw2 = set_edge_weight(g2, w)
    @test get_edge_weight(gw2) == w
end

@testset "to_bidirected" begin if GRAPH_T == :coo
    s, t = [1, 2, 3, 3, 4], [2, 3, 4, 4, 4]
    w = [1.0, 2.0, 3.0, 4.0, 5.0]
    e = [10.0, 20.0, 30.0, 40.0, 50.0]
    g = GNNGraph(s, t, w, edata = e)

    g2 = to_bidirected(g)
    @test g2.num_nodes == g.num_nodes
    @test g2.num_edges == 7
    @test is_bidirected(g2)
    @test !has_multi_edges(g2)

    s2, t2 = edge_index(g2)
    w2 = get_edge_weight(g2)
    @test s2 == [1, 2, 2, 3, 3, 4, 4]
    @test t2 == [2, 1, 3, 2, 4, 3, 4]
    @test w2 == [1, 1, 2, 2, 3.5, 3.5, 5]
    @test g2.edata.e == [10.0, 10.0, 20.0, 20.0, 35.0, 35.0, 50.0]
end end

@testset "to_unidirected" begin if GRAPH_T == :coo
    s = [1, 2, 3, 4, 4]
    t = [2, 3, 4, 3, 4]
    w = [1.0, 2.0, 3.0, 4.0, 5.0]
    e = [10.0, 20.0, 30.0, 40.0, 50.0]
    g = GNNGraph(s, t, w, edata = e)

    g2 = to_unidirected(g)
    @test g2.num_nodes == g.num_nodes
    @test g2.num_edges == 4
    @test !has_multi_edges(g2)

    s2, t2 = edge_index(g2)
    w2 = get_edge_weight(g2)
    @test s2 == [1, 2, 3, 4]
    @test t2 == [2, 3, 4, 4]
    @test w2 == [1, 2, 3.5, 5]
    @test g2.edata.e == [10.0, 20.0, 35.0, 50.0]
end end

@testset "Graphs.Graph from GNNGraph" begin
    g = rand_graph(10, 20, graph_type = GRAPH_T)

    G = Graphs.Graph(g)
    @test nv(G) == g.num_nodes
    @test ne(G) == g.num_edges ÷ 2

    DG = Graphs.DiGraph(g)
    @test nv(DG) == g.num_nodes
    @test ne(DG) == g.num_edges
end

@testset "random_walk_pe" begin
    s = [1, 2, 2, 3]
    t = [2, 1, 3, 2]
    ndata = [-1, 0, 1]
    g = GNNGraph(s, t, graph_type = GRAPH_T, ndata = ndata)
    output = random_walk_pe(g, 3)
    @test output == [0.0 0.0 0.0
                     0.5 1.0 0.5
                     0.0 0.0 0.0]
end
