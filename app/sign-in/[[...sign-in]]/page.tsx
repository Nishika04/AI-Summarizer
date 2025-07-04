// import BgGradient from '@/components/common/bg-gradient'
// import { SignIn } from '@clerk/nextjs'

// export default function Page() {
//   return (
//   <section className='flex justify-center items-center lg:min-h-[40vh]'>
//      <BgGradient className='from-rose-400 via-rose-300 to-orange-200' />
//       <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
      
     
//       <SignIn />
//       </div>
//     </section> 
//  );
//  }

import BgGradient from '@/components/common/bg-gradient'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="relative flex justify-center items-center h-screen w-screen overflow-hidden">
      <BgGradient className="from-rose-400 via-rose-300 to-orange-200 absolute inset-0 z-0" />
      
      <div className="z-10">
        <SignIn />
      </div>
    </section>
  )
}
