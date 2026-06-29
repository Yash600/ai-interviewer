import "server-only";
import { StateGraph, START, END } from "@langchain/langgraph";
import { InterviewStateAnnotation, type InterviewState } from "./state";
import { evaluateAnswerNode } from "./nodes/evaluate";
import { routerNode, routerEdge } from "./nodes/router";
import { generateResponseNode } from "./nodes/generate";

const graph = new StateGraph(InterviewStateAnnotation)
  // Nodes — cast to any to bypass LangGraph's strict internal UpdateType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .addNode("evaluate", evaluateAnswerNode as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .addNode("route",    routerNode as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .addNode("generate", generateResponseNode as any)

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await interviewGraph.invoke(state as any);
  return result as InterviewState;
}
