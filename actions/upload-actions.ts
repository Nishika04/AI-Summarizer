// 'use server';

// import { generateSummaryFromGemini } from "@/lib/geminiai";
// import { fetchAndExtractPdf } from "@/lib/langchain";
// import { generateSummaryFromOpenAI } from "@/lib/openai";

// export async function generatePdfSummary(uploadResponse: [{
//     serverData: {
//         userId: string;
//         file: {
//             url: string;
//             name: string;
//         };
//     };
// }]) {
//     if(!uploadResponse){
//         return {
//             success: false,
//             message: 'File upload failed',
//             data: null,
//         };
//     }

//     const {
//         serverData: {
//         {userId},
//         url: pdfUrl, name: fileName,
//     },
// }= uploadResponse[0];

// if(!pdfUrl){
//     return {
//         success: false,
//         message: 'File upload failed',
//         data: null,
//     };
// }

// try{
//         const pdfText= await fetchAndExtractPdf(pdfUrl);
//         console.log({pdfText});
        
//         let summary;
//         try{
//             summary = await generateSummaryFromOpenAI(pdfText);
//             console.log({summary});
//         } catch (error) {
//             console.log(error);
//             //call gemini
//             if(error instanceof Error && error.message==='RATE_LIMIT_EXCEEDED'){
//                 try {
//                     summary= await generateSummaryFromGemini(pdfText);
//                     console.log({summary});

//                 }catch(geminiError){
//                     console.error(
//                         'Gemini API failed after OpenAI quota exceeded', geminiError
//                     );
//                     throw new Error('Failed to generate summary with available AI providers. ')
//                 }
//             }
//         }

//         if (!summary) {
//             return {
//                 success: false,
//                 message: 'Failed to generate summary',
//                 data: null,
//             };
//         }
//         return {
//             success: true,
//             message: 'Summary generated successfully',
//             data: {
//                 summary,

//             },
//         }
//     } catch(err) {
//         return {
//             success: false,
//             message: 'Failed to generate summary',
//             data: null,
//         };
//     }
// }

'use server';

import { getDbConnection } from "@/lib/db";
import { generateSummaryFromGemini } from "@/lib/geminiai";
import { fetchAndExtractPdf } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


interface PdfSummaryType{
  userId: string; 
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

type UploadThingResponseItem = {
  url: string;
  name: string;
  serverData: {
    userId: string;
  };
};

export async function generatePdfSummary(uploadResponse: UploadThingResponseItem[]) {
  if (!uploadResponse || uploadResponse.length === 0) {
    return {
      success: false,
      message: 'File upload failed',
      data: null,
    };
  }

  const {
    serverData: { userId },
    url: pdfUrl,
    name: fileName,
  } = uploadResponse[0];

  if (!pdfUrl) {
    return {
      success: false,
      message: 'File upload failed',
      data: null,
    };0
  }

  try {
    const pdfText = await fetchAndExtractPdf(pdfUrl);
    console.log({ pdfText });

    let summary;
    try {
      summary = await generateSummaryFromOpenAI(pdfText);
      console.log({ summary });
    } catch (error) {
      console.log(error);

      // If OpenAI fails due to quota
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        try {
          summary = await generateSummaryFromGemini(pdfText);
          console.log({ summary });
        } catch (geminiError) {
          console.error(
            'Gemini API failed after OpenAI quota exceeded',
            geminiError
          );
          throw new Error('Failed to generate summary with available AI providers.');
        }
      }
    }

    if (!summary) {
      return {
        success: false,
        message: 'Failed to generate summary',
        data: null,
      };
    }

    const formattedFfileName= formatFileNameAsTitle(fileName);

    return {
      success: true,
      message: 'Summary generated successfully',
      data: {
        title:formattedFfileName,
        summary,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to generate summary',
      data: null,
    };
  }
}


async function savePdfSummary({
  userId, 
  fileUrl, 
  summary, 
  title, 
  fileName
}: PdfSummaryType) {
  //sql inserting pdf summary
  try{
    const sql= await getDbConnection();
    const [savedSummary]= await sql `
    INSERT INTO pdf_summaries(
    user_id, 
    original_file_url, 
    summary_text, 
    title, 
    file_name
   ) VALUES (
    ${userId},
    ${fileUrl},
    ${summary},
    ${title},
    ${fileName}
    )RETURNING id, summary_text`;
    return savedSummary;
  }catch(error){
    console.error('Error saving PDF summary', error);
    throw error;
  }
}
export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,

}: PdfSummaryType) {
  //user is logged in and has a userId
  //savePdfSummary

  let savedSummary: any;
  try{
    const {userId}= await auth();
    if(!userId){
      return{
      success: false,
      message:'User not found',
    };
    }
    savedSummary=await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });

    if(!savedSummary){
      return {
      success: false,
      message:'Failed to save PDF summary, please try again...',
    };
    }
    
  } catch(error){
    return{
      success: false,
      message:
        error instanceof Error ? error.message:'Error saving PDF summary',
    };
    
  }

  //Rvalidate our cache
revalidatePath(`/summaries/${savedSummary.id}`);
// redirect()

  return {
      success: true,
      message:'PDF summary saved successfully',
      data: {
        id:savedSummary.id,
      }
    };
}