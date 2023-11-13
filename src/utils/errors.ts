export const getEmptyErrorObject = function(prop: string, value: string){
    return { 
        error: `The ${prop} should not be empty. Please make sure that you are passing the "${value}" value`
    }
}