function updateAppData(params) {
  try {
    const userId = params.userId;
    const userRole = params.userRole;

    // Get user data
    const userData = userRole === "ADMIN" ? getAdminData(userId) : getUserData(userId);
    
    // Get user details from user sheet
    const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("user");
    const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
    const rows = userSheet.getDataRange().getValues();
    
    // Find user row
    const userIdIndex = headers.indexOf("userId");
    const userRowIndex = rows.findIndex((row, index) => index > 0 && row[userIdIndex] === userId);
    
    if (userRowIndex === -1) {
      throw new Error("User not found");
    }

    const user = rows[userRowIndex];

    // Format user response
    const userResponse = {
      id: userId,
      userId: userId,
      email: user[headers.indexOf("email")],
      username: user[headers.indexOf("username")],
      role: userRole,
      verifyStatus: user[headers.indexOf("verifyStatus")] || "FALSE",
      balance: user[headers.indexOf("balance")] || "0.00",
      pendingBalance: user[headers.indexOf("pendingBalance")] || "0.00",
      btcAddress: user[headers.indexOf("btcAddress")] || "",
      ethAddress: user[headers.indexOf("ethAddress")] || "",
      usdtAddress: user[headers.indexOf("usdtAddress")] || ""
    };

    return {
      success: true,
      user: userResponse,
      data: userData,
      needsVerification: userResponse.verifyStatus === "FALSE" || !userResponse.verifyStatus
    };

  } catch (error) {
    Logger.log("Update app data error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update app data" 
    };
  }
}
