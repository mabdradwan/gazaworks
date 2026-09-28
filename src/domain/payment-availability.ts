export function paymentSimulationEnabled(config:{provider?:string;vercelEnvironment?:string;netlifyContext?:string;nodeEnvironment?:string;allow?:string}){
 return config.provider==="mock"&&config.vercelEnvironment!=="production"&&config.netlifyContext!=="production"&&(config.nodeEnvironment!=="production"||config.allow==="true");
}
