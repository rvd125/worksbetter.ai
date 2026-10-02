/* Internal catalogue removed. Public, user-confirmed workflow logic only. */
window.WBSafeguards = Object.freeze({
 enquiry:{title:'Customer enquiry: two separate decisions',cases:[['new','New customer'],['known','Existing customer']],steps:[
 ['Outlook enquiry','A fictional customer sends an enquiry.'],
 ['Check customer records','AI checks the customer database. If needed, research the company from the email domain.'],
 ['Prepare the team brief','The team receives an enriched brief and a prepared meeting reply.'],
 ['Staff approval','A person reviews the prepared response before sending.'],
 ['Zapier sends the reply','Staff approval allows the meeting reply to be sent. The customer time is still unconfirmed.'],
 ['Customer confirms a time','Customer confirmation is a separate event from staff approval.'],
 ['Complete the handover','Connected actions complete confirmation, calendar and invitation, assignment and CRM updates.']]},
 invoice:{title:'Supplier invoice: stop, approve or decline',cases:[['match','New invoice; purchase order matches'],['mismatch','New invoice; purchase order differs'],['duplicate','Already recorded in MYOB']],steps:[
 ['Invoice received','The supplier and invoice in this demonstration are fictional.'],
 ['Check MYOB','AI checks for an existing invoice. A duplicate stops here.'],
 ['Compare the purchase order','A new invoice is compared with its purchase order. A mismatch remains visible.'],
 ['Human decision','Approve or decline. A mismatch needs an explanation before approval.'],
 ['n8n connects the approved work','Save the invoice in Google Drive, record it in MYOB with approver details, and prepare/connect a Gmail receipt acknowledgement. Receipt is not payment.']]},
 reporting:{title:'Daily reporting: agree the data before the dashboard',cases:[['matched','Source references agree'],['unresolved','An unresolved source reference']],steps:[
 ['Excel, Xero and Simpro','Collect records for the agreed dashboard. This demonstration uses fictional records.'],
 ['Match the references','Connect corresponding records without treating missing information as zero.'],
 ['Reconcile and review','Hold unresolved data for review. Resolve the issue and rerun the checks.'],
 ['Refresh the decision dashboard','Agreed data reaches a dashboard refreshed daily. No numerical saving or business result is claimed.']]}
});
