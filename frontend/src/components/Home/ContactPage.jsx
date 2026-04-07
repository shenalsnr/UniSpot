import PublicNavbar from "./PublicNavbar";


const ContactPage = () => {
  return (
    <>
      <PublicNavbar />

      <PageBackground className="flex justify-center items-start p-4 md:p-8 pt-12">
        <div className="w-full max-w-[1100px] bg-white/85 backdrop-blur-md rounded-[28px] p-6 md:p-10 shadow-2xl animate-fade-in border border-white/60 mx-auto">
          <h1 className="mt-0 text-4xl md:text-[42px] text-slate-900 font-extrabold mb-5 tracking-tight">Contact Us</h1>
          <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium max-w-4xl">
            For registration help, blocked profile issues, or system support,
            please contact the UniSpot management team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="mt-0 mb-2 text-blue-700 text-xl font-bold tracking-tight">Email</h3>
              <p className="m-0 text-slate-700 font-bold text-lg">support@unispot.com</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="mt-0 mb-2 text-blue-700 text-xl font-bold tracking-tight">Phone</h3>
              <p className="m-0 text-slate-700 font-bold text-lg">+94 77 123 4567</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="mt-0 mb-2 text-blue-700 text-xl font-bold tracking-tight">Office</h3>
              <p className="m-0 text-slate-700 font-medium">Student Services Division, Campus Administration Block</p>
            </div>
          </div>
        </div>
      </PageBackground>
    </>
  );
};

export default ContactPage;