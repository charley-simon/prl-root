import { StackStore } from './stores/stackStore';
import { Resolver } from './resolver/resolveContext';
import { precompiledGraph } from './graph/precompiledGraph';
import type { Frame } from './stores/types';

import stackJson from './stores/volumetric_stack.json';

const initialStack: Frame[] = stackJson.map((f: any) => ({
  ...f,
  state: f.state === 'RESOLVED' ? 'RESOLVED' : 'UNRESOLVED'
}));

const stackStore = new StackStore(initialStack);
const resolver = new Resolver(stackStore, precompiledGraph);

resolver.resolveContext();

console.log('--- FINAL STACK ---');
console.log(JSON.stringify(stackStore.getFrames(), null, 2));
