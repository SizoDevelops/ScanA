import { NextResponse } from "next/server";
import { Deta } from "deta";
import * as bcrypt from "bcrypt";


const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base("schools_db");

export async function POST(request) {
  const body = await request.json();

  const {
    school_code,
    school_name,
    school_slogan,
    school_email,
    school_number,
    school_logo,
    school_address: { line_one, line_two, province, city, zip_code },
    members:[],
    school_admin:{
      admin_name,
      admin_code,
      admin_email
    },
  } = body;
  const data = {
    school_code,
    school_name,
    school_slogan,
    school_email,
    school_number,
    school_logo,
    school_address: { line_one, line_two, province, city, zip_code },
    members:[],
    school_admin:{
        admin_name,
        admin_code,
        admin_email
    },
    password: await bcrypt.hash(body.password, 10),
  }

   const schoolSearch = await db.fetch({
    "school_email": school_email, 
    "school_admin.admin_email": admin_email
})

if(schoolSearch.count < 1){
  const school = db.insert(data, school_code);
  const {password, ...result} = school;

  return NextResponse.json(result)
}
  
else {
  return NextResponse.json("User Already Exists")
}

}
