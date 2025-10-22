﻿using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.BellmanFord
{
    public interface IBellmanFordService
    {
        OptimalPathResult Compute(Graph graph, string start, string target);
    }
}
