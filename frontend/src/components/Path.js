const app_name = 'cop4331-5.com' //Change to website url & fix errors

exports.buildPath = 
    function buildPath(route:string) : string
    {
        if (process.env.NODE_ENV != 'development') 
        {
            return 'http://' + app_name + ':42069/' + route;
        }
        else
        {        
            return 'http://localhost:42069/' + route;
        }
    }


