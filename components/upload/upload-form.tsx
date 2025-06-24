"use client";

import { file } from "zod/v4";
import { Button } from "../ui/button";
import UploadFormInput from "./upload-form-input";
import { z } from 'zod';
import { useUploadThing } from "@/utils/uploadthing";
import { toast, useSonner } from "sonner";
import type { UploadedFileData } from "uploadthing/types";
import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const schema=z.object({
    file: z
    .instanceof(File, {message: 'Invalid file'})
    .refine((file: File) => file.size <= 20 *1024 *1024, 'File size must be less than 20MB')
    .refine((file: File) => file.type.startsWith('application/pdf'), 'File must be a PDF'
),
});

export default function UploadForm() {
    // const {toast}=useToast();
    const formRef =useRef<HTMLFormElement>(null);
    const [isLoading, setIsLoading]=useState(false);
    const router=useRouter();


    const {startUpload, routeConfig}= useUploadThing('pdfUploader', {
        onClientUploadComplete : () => {
            console.log('Uploaded successfully');
        },
        onUploadError: (err) => {
            console.log('Error occured while uploading');
            toast('Error occured while uploading',{
                description: err.message,
            })
        },
        onUploadBegin: (file) => {
            console.log('Upload has begun for', file);
        }
    })
    const handleSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try{
            setIsLoading(true);
            const formData= new FormData(e.currentTarget);
        const file= formData.get('file') as File;

        //validating the fields

    const validatedFields =schema.safeParse({file});

    if(!validatedFields.success){
        toast('Something went wrong' ,{
            // variant: 'desctructive',
            description: validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file',
        })
        setIsLoading(false);
            
        return;
    }
    toast('Uploading PDF',{
        description: 'We are uploading your PDF.',
    })
        //schema with zod
        //upload the file to uploadthing

        const resp= await startUpload([file]);
        if(!resp) {
            toast('Something went wrong',{
                description: 'Please use a different file',
                // variant:'destructive', 
            })
            setIsLoading(false);
            return;
        }

        toast('PDF is processing' ,{
            description: 'Hang tight! Our AI is reading through your document!',
        })
        //parse the pdf using langchain

        const result= await generatePdfSummary(resp);
        // console.log({summary});

        const {data=null, message=null}= result || {};

        if (data){
            let storeResult: any;
            toast('PDF is saving' ,{
            description: 'Hang tight! We are saving your summary!',
        });
        
            if (data.summary) {
                storeResult= await storePdfSummaryAction({
                    summary: data.summary,
                    fileUrl: resp[0].serverData.fileUrl,
                    title: data.title,
                    fileName: file.name,
                    userId: resp[0].serverData.userId, // ✅ Add this line
    });
    toast ('Summary Generated!', {
        description: 'Your PDF has been successfully summarized and saved!',
    });

    formRef.current?.reset();
    router.push(`/summaries/${storeResult.data.id}`);
}

            }
        }

         catch (error){
            setIsLoading(false);
            console.error('Error occured.', error);
            formRef.current?.reset();
        } finally {
            setIsLoading(false);
        }
        // console.log('submitted');
        
        //summarise the pdf using ai
        //save the summary to the database
        //redirect to the [id] of the summary page
    };
    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
            <UploadFormInput isLoading={isLoading} ref={formRef} onSubmit={handleSubmit} />
        </div>
    )
}