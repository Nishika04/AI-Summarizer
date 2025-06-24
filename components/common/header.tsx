// 'use client';

// import NavLink from './nav-link';
// import { FileText } from 'lucide-react'
// import { Button } from "../ui/button";
// import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
// import PlanBadge from './plan-badge';

// export default function Header(){
//     return (
//     <nav className="container flex items-center
//     justify-between py-4 lg:px-8 px-2 mx-auto">

//         <div className="flex lg:flex-1 ">
//         <NavLink href="/" className="flex items-center
//         gap-1 lg:gap-2 shrink-0">
//             <FileText className="w-5 h-5 lg:w-8 lg:h-8
//             text-gray-900 hover:rotate-12 transform *
//             transition duration-200 ease-in-out"/> 
//             <span className="font-extrabold lg:text-xl
//             text-gray-900">Sommaire
//             </span>
//         </NavLink>
//         </div>

//         <div className="flex lg:justify-center
//         gap-4 lg:gap-12 lg:items-center">
//             <NavLink href="/#pricing">Pricing</NavLink>
//             {<SignedIn> 
//                 <NavLink href="/dashboard">Your 
//             Summaries</NavLink>
//             </SignedIn>} </div>
     

//         <div className="flex lg:justify-end lg:flex-1">
//                 <div className="flex gap-2 items-center">
//                     <NavLink href="/upload">Upload a PDF</NavLink>
//                     <PlanBadge />
//                     <SignedIn>
//                         <UserButton />
//                     </SignedIn>
//                     </div>
                    
          
//                 <SignedOut>
//                 <div>
//                 <NavLink href="/sign-in">Sign In</NavLink>
//                 </div>
//                 </SignedOut>
                

//             </div>
//         </nav>
//     );
// }

// 'use client';

// export default function Header() {
//   return <nav>This is a test header</nav>;
// }

'use client';

import { useUser } from '@clerk/nextjs';
import NavLink from './nav-link';
import { FileText } from 'lucide-react';

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <nav className="flex justify-between items-center p-4">
      <NavLink href="/">
        <FileText className="inline w-5 h-5 mr-2" />
        Sommaire
      </NavLink>

      <div className="flex items-center gap-4">
        <NavLink href="/#pricing">Pricing</NavLink>
        <NavLink href="/upload">Upload PDF</NavLink>
        {isSignedIn ? (
          <NavLink href="/dashboard">Dashboard</NavLink>
        ) : (
          <NavLink href="/sign-in">Sign In</NavLink>
        )}
      </div>
    </nav>
  );
}


