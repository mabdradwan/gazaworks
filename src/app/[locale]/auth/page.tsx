import { AuthForm } from "@/components/forms/auth-form";
export default async function Auth({params}:{params:Promise<{locale:string}>}) { return <section className="container auth-wrap"><AuthForm locale={(await params).locale}/></section>; }
