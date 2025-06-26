#!/usr/bin/env -S deno run --allow-env --allow-net

import { createRecruitmentOrchestrator, WorkflowTemplates } from "./supabase/functions/_shared/orchestration/index.ts";

// Test configuration
const TEST_CONFIG = {
  googleApiKey: Deno.env.get('GOOGLE_API_KEY') || 'your-test-api-key',
  nymeriaApiKey: Deno.env.get('NYMERIA_API_KEY'),
  debug: true
};

async function testSingleAgent() {
  console.log('\n🧪 Testing Single Agent Execution...\n');
  
  const orchestrator = createRecruitmentOrchestrator(TEST_CONFIG);
  
  // Test 1: Boolean Search Generation
  console.log('1️⃣ Testing Boolean Search Generation:');
  try {
    const booleanResult = await orchestrator.runSingleAgent('BooleanSearchAgent', {
      requirements: 'Senior React Developer with 5+ years experience, AWS knowledge preferred',
      complexity: 'medium',
      platform: 'LinkedIn'
    });
    console.log('✅ Boolean Search Result:', booleanResult);
  } catch (error) {
    console.error('❌ Boolean Search Error:', error);
  }

  // Test 2: Task Execution
  console.log('\n2️⃣ Testing Task Agent:');
  try {
    const taskResult = await orchestrator.runSingleAgent('TaskAgent', {
      task: 'Calculate the monthly salary for a $150,000 annual salary',
      context: 'US-based position'
    });
    console.log('✅ Task Result:', taskResult);
  } catch (error) {
    console.error('❌ Task Error:', error);
  }

  // Test 3: Compensation Analysis
  console.log('\n3️⃣ Testing Compensation Agent:');
  try {
    const compResult = await orchestrator.runSingleAgent('CompensationAgent', {
      task: 'analyze',
      context: `
        Role: Senior Software Engineer
        Location: San Francisco, CA
        Experience Level: 7 years
        Skills: React, Node.js, AWS, Python
      `
    });
    console.log('✅ Compensation Result:', compResult);
  } catch (error) {
    console.error('❌ Compensation Error:', error);
  }
}

async function testWorkflows() {
  console.log('\n🔄 Testing Workflow Execution...\n');
  
  const orchestrator = createRecruitmentOrchestrator(TEST_CONFIG);

  // Test 1: Candidate Sourcing Workflow
  console.log('1️⃣ Testing Candidate Sourcing Workflow:');
  try {
    const workflowResult = await orchestrator.runWorkflow(
      WorkflowTemplates.candidateSourcing,
      {
        requirements: 'Senior Full Stack Developer with React and Node.js experience in San Francisco'
      }
    );
    
    console.log('✅ Workflow completed!');
    console.log('   - Success:', workflowResult.success);
    console.log('   - Duration:', workflowResult.duration, 'ms');
    console.log('   - Steps completed:', workflowResult.metadata.stepsCompleted, '/', workflowResult.metadata.totalSteps);
    console.log('   - Results:', Object.keys(workflowResult.results));
    
    if (Object.keys(workflowResult.errors).length > 0) {
      console.log('   - Errors:', workflowResult.errors);
    }
  } catch (error) {
    console.error('❌ Workflow Error:', error);
  }

  // Test 2: Compensation Analysis Workflow
  console.log('\n2️⃣ Testing Compensation Analysis Workflow:');
  try {
    const compWorkflowResult = await orchestrator.runWorkflow(
      WorkflowTemplates.compensationAnalysis,
      {
        role: 'Senior Software Engineer',
        location: 'San Francisco, CA'
      }
    );
    
    console.log('✅ Compensation workflow completed!');
    console.log('   - Success:', compWorkflowResult.success);
    console.log('   - Duration:', compWorkflowResult.duration, 'ms');
  } catch (error) {
    console.error('❌ Compensation Workflow Error:', error);
  }
}

async function testParallelExecution() {
  console.log('\n⚡ Testing Parallel Agent Execution...\n');
  
  const orchestrator = createRecruitmentOrchestrator(TEST_CONFIG);
  
  try {
    const results = await orchestrator.runParallelAgents([
      {
        agentName: 'BooleanSearchAgent',
        params: {
          requirements: 'Python Developer',
          complexity: 'simple'
        }
      },
      {
        agentName: 'BooleanSearchAgent',
        params: {
          requirements: 'DevOps Engineer',
          complexity: 'simple'
        }
      },
      {
        agentName: 'TaskAgent',
        params: {
          task: 'List top 3 skills for a Data Scientist'
        }
      }
    ]);
    
    console.log('✅ Parallel execution completed!');
    for (const [key, result] of Object.entries(results)) {
      console.log(`   - ${key}:`, result.success ? 'Success' : 'Failed');
    }
  } catch (error) {
    console.error('❌ Parallel Execution Error:', error);
  }
}

async function testSequentialExecution() {
  console.log('\n🔗 Testing Sequential Agent Execution...\n');
  
  const orchestrator = createRecruitmentOrchestrator(TEST_CONFIG);
  
  try {
    const results = await orchestrator.runSequentialAgents([
      {
        agentName: 'BooleanSearchAgent',
        params: {
          requirements: 'React Developer with TypeScript',
          complexity: 'medium'
        }
      },
      {
        agentName: 'TaskAgent',
        params: (previousResult: string) => ({
          task: `Optimize this boolean search for better results: ${previousResult}`
        })
      }
    ]);
    
    console.log('✅ Sequential execution completed!');
    console.log('   - Step 1 (Generate):', results[0]?.substring(0, 100) + '...');
    console.log('   - Step 2 (Optimize):', results[1]?.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Sequential Execution Error:', error);
  }
}

async function testCustomWorkflow() {
  console.log('\n🎯 Testing Custom Workflow...\n');
  
  const orchestrator = createRecruitmentOrchestrator(TEST_CONFIG);
  
  // Define a custom workflow
  const customWorkflow = {
    id: 'test-custom-workflow',
    name: 'Test Custom Workflow',
    description: 'A simple test workflow',
    steps: [
      {
        id: 'step1',
        agentName: 'TaskAgent',
        params: {
          task: 'Generate a list of 5 important skills for a Product Manager'
        }
      },
      {
        id: 'step2',
        agentName: 'TaskAgent',
        params: {
          task: 'Based on these skills: {{step1.output}}, create interview questions'
        },
        dependsOn: ['step1']
      }
    ],
    onError: 'continue' as const
  };
  
  try {
    const result = await orchestrator.runWorkflow(customWorkflow);
    
    console.log('✅ Custom workflow completed!');
    console.log('   - Success:', result.success);
    console.log('   - Results:', result.results.step1?.success, result.results.step2?.success);
  } catch (error) {
    console.error('❌ Custom Workflow Error:', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Agentic Orchestration Tests\n');
  console.log('=' .repeat(50));
  
  try {
    await testSingleAgent();
    console.log('\n' + '=' .repeat(50));
    
    await testWorkflows();
    console.log('\n' + '=' .repeat(50));
    
    await testParallelExecution();
    console.log('\n' + '=' .repeat(50));
    
    await testSequentialExecution();
    console.log('\n' + '=' .repeat(50));
    
    await testCustomWorkflow();
    
    console.log('\n' + '=' .repeat(50));
    console.log('\n✨ All tests completed!\n');
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Run tests
if (import.meta.main) {
  runAllTests();
}