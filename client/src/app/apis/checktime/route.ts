import { Saving } from "@/db/models/savings";
import { indonesianDate } from "@/helpers/IndonesianDate";
import axios from "axios";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
  // throw new Error("aaa")
  const CRON_PASS = request.headers.get("CRON_PASS")
  if (CRON_PASS != process.env.CRON_PASS) {
    // console.log("canot lah");
    
    return redirect("/")
  }
  
  const data = await Saving.getlatest();
  const currentDate = indonesianDate(); // Get the current date

  data.forEach(async(e) => {
    if (e.latest && e.latest.createdAt) {
      const createdAtDate = new Date(e.latest.createdAt); // Parse createdAt date
      const timeDiff = currentDate.getTime() - createdAtDate.getTime(); // Difference in milliseconds
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24); // Convert to days
      // console.log("🚀 ~ data.forEach ~ daysDiff:", daysDiff,e.user)
      
      if (daysDiff < 31 && daysDiff >= 30) {
        console.log("🚀 ~ data.forEach ~ daysDiff:", daysDiff,e)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/apis/send`, {
              email: e.user.email,
              username: e.user.username,
              CRON_PASS:CRON_PASS
            });
        } catch (error) {
            console.log("🚀 ~ data.forEach ~ error:", error)
            
        }
        // console.log(
        //   `The gap is 30 days or more for createdAt: ${createdAtDate}`
        // );
        // Perform your logic here
      }
    }
  });

  return NextResponse.json("Sending Email");
}
