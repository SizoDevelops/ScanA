import { signJwtAccessToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";

import { getUserCollection, updateCollectionMembers } from "@/lib/databaseFunctions";

export async function POST(request) {
  try {
    const body = await request.json();

    const user = await getUserCollection(body.school_code)


    if (user) {
      const result = user.members.find(
        (item) => item.code === body.code
      );
      if (
        result &&
        result.password &&
        (await bcrypt.compare(body.password, result.password))
      ) {
        const {
          date,
          email,
          first_name,
          pause_register,
          persal,
          phone_number,
          reason,
          title,
          attendance,
          position,
          subjects,
          password,
          ...userWithoutPass
        } = result;
        const accessToken = signJwtAccessToken(userWithoutPass);
        const resultUser = {
          ...userWithoutPass,
          accessToken,
        };

        return NextResponse.json(resultUser);

      } else if (result && !result.password) {
        const users = user.members.filter(
          (item) => item.id !== result.id
        );

        result.password = await bcrypt.hash(body.password, 10);

        users.push(result);

        const s = await updateCollectionMembers(user.school_code, users);
        const {
          date,
          email,
          first_name,
          initial,
          last_name,
          pause_register,
          persal,
          phone_number,
          reason,
          title,
          attendance,
          position,
          subjects,
          password,
          ...userWithoutPass
        } = result;
        const accessToken = signJwtAccessToken(userWithoutPass);
        const resultUser = {
          ...userWithoutPass,
          accessToken,
        };
        return NextResponse.json(resultUser);
      } else return NextResponse.json(null);
    } else return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}
