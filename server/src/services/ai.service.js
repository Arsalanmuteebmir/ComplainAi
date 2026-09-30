import OpenAI from 'openai';
const client=()=>process.env.XAI_API_KEY?new OpenAI({apiKey:process.env.XAI_API_KEY,baseURL:'https://api.x.ai/v1',timeout:120000}):null;
const categories=['ROADS','EDUCATION','HEALTH','ELECTRICITY','WATER','SAFETY','OTHER'];
function fallback({title,description}){const text=`${title} ${description}`.toLowerCase();let category='OTHER';if(/road|pothole|street|bridge|traffic/.test(text))category='ROADS';else if(/school|college|teacher|education|exam/.test(text))category='EDUCATION';else if(/hospital|doctor|medicine|health/.test(text))category='HEALTH';else if(/electric|power|transformer|wire/.test(text))category='ELECTRICITY';else if(/water|drain|sewage|pipe/.test(text))category='WATER';else if(/crime|police|unsafe|theft|security/.test(text))category='SAFETY';return {summary:description.slice(0,300),reason:'Local fallback analysis because XAI_API_KEY is not configured.',category,subcategory:'General',priority:/danger|fire|accident|exposed|collapse|emergency/.test(text)?'CRITICAL':'MEDIUM',confidence:.55,imageObservations:[],safetyFlags:[],recommendedDepartment:category};}
export async function analyzeComplaint({title,description,location,imageUrl}){
  const ai=client(); if(!ai) return fallback({title,description});
  const prompt=`You are the AI triage layer of a centralized public complaint system. Analyze the citizen complaint objectively. Return ONLY valid JSON with keys: summary, reason, category, subcategory, priority, confidence, imageObservations, safetyFlags, recommendedDepartment, duplicateSearchTerms. category must be one of ${categories.join(', ')}. priority must be LOW, MEDIUM, HIGH or CRITICAL. confidence is 0-1. Do not invent facts. Treat image observations as observations, not proof. Complaint title: ${title}. Description: ${description}. Selected location: ${location.address} (${location.latitude}, ${location.longitude}).`;
  const content=[{type:'input_text',text:prompt}]; if(imageUrl)content.push({type:'input_image',image_url:imageUrl,detail:'high'});
  const response=await ai.responses.create({model:process.env.XAI_MODEL||'grok-4.7',input:[{role:'user',content}],store:false});
  const text=response.output_text||''; const match=text.match(/\{[\s\S]*\}/); if(!match)throw new Error('Grok did not return JSON');
  const parsed=JSON.parse(match[0]);
  if(!categories.includes(parsed.category))parsed.category='OTHER';
  return parsed;
}
