window.WBProjects = {
  invoice: {
    name:'Finished job → invoice draft', caption:'The job is done. Why is the invoice still waiting?',
    description:'The challenge: extra work is recorded but not approved. Change the amounts, then decide what belongs on the invoice.',
    stack:['n8n','Webhook','Simpro','Xero','OpenAI'], engine:'n8n + webhook',
    nodes:[['Job completed','Simpro event','SP','auto'],['Read job notes','AI · OpenAI','AI','ai'],['Match the job','Simpro record','SP','tool'],['Calculate lines','Agreed rates','$','auto'],['Separate extra work','Approval rule','↳','auto'],['Approve scope','You decide','','human'],['Prepare invoice','Xero draft','X','auto']],
    positions:[[10,30],[34,30],[25,72],[47,72],[61,30],[75,72],[89,30]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Read the job notes','Find the customer and rates','Re-key invoice lines','Chase extra-work approval','Type the approved changes again'],
    next:['Job completion starts the process','AI extracts the recorded work','Rules calculate and separate extras','You approve the scope once','Approved lines flow into a draft'],
    delay:'The invoice waits in an admin queue before someone re-enters the job.',
    relief:'One recorded job flows through to a draft; only the scope decision waits for you.',
    estimate:{volume:40,before:18,after:4,unit:'jobs / week'},
    effects:['Approved scope retained','Invoice draft prepared','Job reference carried across']
  },
  enquiry: {
    name:'New enquiry → coordinated follow-up',caption:'One enquiry. Three places to update. No clear owner.',
    description:'The challenge: an urgent customer request can be lost between a form, an inbox and the team. Try changing the message or tone.',
    stack:['Zapier','Jotform','Outlook','Airtable','Teams','Anthropic'],engine:'Zapier',
    nodes:[['Enquiry received','Jotform','JF','auto'],['Understand the ask','AI · Anthropic','AI','ai'],['Find missing details','Intake guide','?','tool'],['Check urgency','Timing rule','◷','auto'],['Prepare a response','Outlook draft','O','auto'],['Review the reply','You decide','','human'],['Pass it forward','Airtable + Teams','↳','auto']],
    positions:[[10,25],[35,25],[60,25],[85,25],[85,70],[57,70],[23,70]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Open the form notification','Interpret what the customer needs','Copy details into a lead tracker','Write a reply from scratch','Forward context to the team'],
    next:['The form starts the handover','AI identifies the request','Missing details and urgency are checked','You refine the proposed response','Lead context flows to the team'],
    delay:'The team waits for someone to copy the enquiry out of their inbox.',
    relief:'The same enquiry carries its context into the reply, lead record and team handover.',
    estimate:{volume:30,before:15,after:3,unit:'enquiries / week'},
    effects:['Reply marked ready','Airtable handover prepared','Teams context prepared']
  },
  finance: {
    name:'Scattered figures → a decision',caption:'Revenue looks fine. Which jobs are quietly losing margin?',
    description:'The challenge: account totals hide individual jobs. Change the sample figures and the threshold to test what needs attention.',
    stack:['MCP server','Xero or MYOB','Excel','OpenRouter'],engine:'MCP + controlled tools',
    nodes:[['Ask about margins','Business question','?','auto'],['Read the figures','Xero or MYOB','↔','tool'],['Match each job','Excel context','XL','tool'],['Calculate margins','Explicit calculation','%','auto'],['Explain the signal','AI · OpenRouter','AI','ai'],['Choose what to review','Your judgement','','human'],['Prepare a briefing','Evidence + figures','▥','auto']],
    positions:[[10,48],[31,22],[31,73],[53,48],[74,22],[74,73],[92,48]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Export account figures','Find the matching job spreadsheet','Join and check the rows','Calculate the margins','Build a briefing for the meeting'],
    next:['Start with a business question','Authorised tools provide figures','Job context is matched','Calculations support the AI explanation','You decide what warrants action'],
    delay:'A simple question waits for the next spreadsheet refresh or reporting cycle.',
    relief:'A question starts the analysis. Figures stay attached to the explanation.',
    estimate:{volume:3,before:90,after:15,unit:'briefings / week'},
    effects:['Job evidence retained','Low-margin list prepared','Meeting briefing prepared']
  },
  onboarding: {
    name:'New starter → ready for day one',caption:'A start date is set. Is everything actually ready?',
    description:'The challenge: missing evidence must stop a handover, while completed details should never need to be typed twice. Toggle the sample records.',
    inputs:{person:'Alex Morgan',role:'Field technician',contract:'yes',induction:'no',licence:'yes'},
    stack:['Webhooks','Employment Hero','SharePoint','Teams','Anthropic'],engine:'Webhooks + rules',
    nodes:[['Starter record updated','Employment Hero','EH','auto'],['Understand the role','AI · Anthropic','AI','ai'],['Find the evidence','SharePoint','SP','tool'],['Check requirements','Role checklist','✓','auto'],['Ready or missing?','Evidence rule','↳','auto'],['Confirm the next step','People team','','human'],['Prepare the handover','Teams + checklist','T','auto']],
    positions:[[10,24],[34,24],[60,24],[85,24],[85,73],[58,73],[23,73]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Read the starter notification','Re-type details into a checklist','Hunt through folders for evidence','Chase the missing items','Tell the team what is ready'],
    next:['An update starts the checks','Role context shapes the checklist','Existing evidence is reused','You review readiness or the gaps','A clear handover follows your decision'],
    delay:'A manager waits for another manual checklist update to know what is missing.',
    relief:'An updated record triggers the checks; missing evidence remains visible until resolved.',
    estimate:{volume:4,before:45,after:10,unit:'starters / week'},
    effects:['Starter details retained','Evidence checklist prepared','Teams handover prepared']
  }
};

Object.assign(window.WBProjects,{"routing": {"name": "New lead \u2192 accountable owner", "old": ["Read the incoming lead", "Work out the territory and service", "Check whether someone already owns it", "Ask around for an available person", "Forward the message and update the tracker"], "next": ["A lead starts the intake", "The request is classified", "Rules check existing ownership and capacity", "You confirm the recommended route", "The owner receives context and a next action"], "delay": "A lead waits while the team forwards messages and asks who should take it.", "relief": "The routing reason stays attached to the handover. Exceptions have a queue.", "estimate": {"volume": 35, "before": 12, "after": 3, "unit": "leads / week"}}, "reporting": {"name": "Scattered sources \u2192 management pack", "old": ["Export three systems", "Find the reporting period", "Copy figures into a report", "Chase missing or stale extracts", "Write commentary and circulate the pack"], "next": ["One reporting request starts collection", "Source measures remain separately labelled", "Freshness and availability checks flag gaps", "A narrative is drafted from the supplied evidence", "You review the source-linked report"], "delay": "The meeting pack waits for another spreadsheet export and manual update.", "relief": "The report shows both the evidence available and the information still missing.", "estimate": {"volume": 1, "before": 180, "after": 25, "unit": "reports / week"}}});
