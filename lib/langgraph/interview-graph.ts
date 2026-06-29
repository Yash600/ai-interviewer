import "server-only";
import { StateGraph, START, END } from "@langchain/langgraph";
import { InterviewStateAnnotation, type InterviewState } from "./state";
import { evaluateAnswerNode } from "./nodes/evaluate";
import { routerNode, routerEdge } from "./nodes/router";
import { generateResponseNode } from "./nodes/generate";

const graph = new StateGraph(InterviewStateAnnotation)
  // Nodes
  .addNode("evaluate", evaluateAnswerNode)
  .addNode("route",    routerNode)
  .addNode("generate", generateResponseNode)

  // Edges
  .addEdge(START,      "evaluate")
  .addEdge("evaluate", "route")

  // Conditional: route decides what to do next
  // All paths lead to generate — the action context is stored in state.nextAction
  .addConditionalEdges("route", routerEdge, {
    followup:      "generate",
    next_question: "generate",
    close:         "generate",
    null:          "generate",  // opening turn
  })

  .addEdge("generate", END);

export const interviewGraph = graph.compile();

// Helper: run one turn of the interview
export async function runInterviewTurn(state: InterviewState): Promise<InterviewState> {
  const result = await interviewGraph.invoke(state);
  return result as InterviewState;
}
