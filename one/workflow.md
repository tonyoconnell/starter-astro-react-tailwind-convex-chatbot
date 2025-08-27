Important: Ensure that multiple subagents .claude/agents will be spawned in parallel  

1. Start Agent ONE
Loads /one/one.md
Loads /one/me/me.md
Loads /one/company/company.md

Write mission .one/tasks/brownfield-create-mission.md .one/templates/mission-tmpl.yaml
Check mission using .one/tasks/mission-quality-gate.md /one/checklists/mission.md 

2. Assign to Engineering Director
Load /one/architecture/architecture.md .one/templates/architecture-tmpl.yaml product.md .one/templates/product-tmpl.yaml ontology.md 
Load /one/teams/engineering.md 

Write the stories .one/templates/story-rocket-tmpl.yaml .one/templates/story-tmpl.yaml
Share stories with the engineering team
Find the right specialist agent to refine the story 

3. Assign to Specialist Agents
Refine the stories

4. Assign to Engineering Director
Check story quality [ ](../../.one/tasks/story-qualtiy.md) 
Improve or Mark as ready .one/tasks/validate-next-story.md .one/tasks/review-story.md 

5. Engineering Director writes a list of tasks .one/workflows/story-to-task-decomposition.yaml 
Task name, task description, story, depends on (other task), assigned to agent, status

6. Launch 5 Agents in parallel to execute the tasks
Launch agents to write the tasks 
Check task quality .one/tasks/task-quality.md
and then work on the tasks 

7. Launch Tester

Write a test 
Run the test 

8. Launch Documenter 
Write documentation

9. Check if done [text](../../.one/checklists/done-checklist.md)

10. Run improver agent

11. Commit and push 

12. Next task

13. When all the tasks for a story are done Check if story done [text](../../.one/checklists/done-checklist.md)
14. Run improver agent
15. Commit and push 
16. When all the tasks for a story are done Check if story done [text](../../.one/checklists/done-checklist.md)
17. Run improver agent
18. Commit and push 














