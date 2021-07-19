var API_KEY = "1234";

var express = require("express");
var router = express.Router();
const { poolPromise, sql } = require("../db");

router.get("/", function (req, res) {
  res.end("API RUNNING");
});

/*
 * Begin: User table: POST, GET
 */

router.get("/user", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var fbid = req.query.fbid;
    if (fbid != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("fbid", sql.NVarChar, fbid)
          .query(
            "Select UserPhone, Name, Address, Fbid From [User] Where Fbid = @fbid"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      res.end(
        JSON.stringify({ success: false, message: "Missing fqid in query" })
      );
    }
  }
});

router.post("/user", async (req, res, next) => {
  console.log(req.body);
  if (req.body.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var user_phone = req.body.userPhone;
    var user_name = req.body.name;
    var user_address = req.body.address;
    var fbid = req.body.fbid;
  }
  if (fbid != null) {
    try {
      const pool = await poolPromise;
      const queryResult = await pool
        .request()
        .input("UserPhone", sql.NVarChar, user_phone)
        .input("Name", sql.NVarChar, user_name)
        .input("Address", sql.NVarChar, user_address)
        .input("Fbid", sql.NVarChar, fbid)
        .query(
          "If Exists(Select * From [User] Where Fbid = @Fbid )" +
            " Update [User] Set Name=@Name, Address=@Address Where Fbid = @Fbid" +
            " Else" +
            " Insert Into [User](Fbid, UserPhone, Name, Address) Output Inserted.Fbid, Inserted.UserPhone, Inserted.Name, Inserted.Address  " +
            " Values(@Fbid, @UserPhone, @Name, @Address)"
        );
      console.log(queryResult);
      if (queryResult.rowsAffected != null) {
        res.send(JSON.stringify({ success: true, message: "Success" }));
      }

      if (queryResult.recordset.length > 0) {
        res.end(
          JSON.stringify({ success: true, result: queryResult.recordset })
        );
      } else {
        res.end(JSON.stringify({ success: false, message: "Empty" }));
      }
    } catch (err) {
      res.status(500);
      res.end(JSON.stringify({ success: false, message: err.message }));
    }
  } else {
    res.end(
      JSON.stringify({
        success: false,
        message: "Missing fqid in body of POST request",
      })
    );
  }
});
/*
 * End: User table: POST, GET
 */
// ---------------------------------------------------
/*
 *Begin: Restaurant table: POST, GET
 */

router.get("/restaurant", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    try {
      const pool = await poolPromise;
      const queryResult = await pool
        .request()
        .query(
          "Select Name, Address, Phone, Lat, Lng, UserOwner, Image, PaymentUrl From Restaurant"
        );
      if (queryResult.recordset.length > 0) {
        res.end(
          JSON.stringify({ success: true, result: queryResult.recordset })
        );
      } else {
        res.end(JSON.stringify({ success: false, message: "Empty" }));
      }
    } catch (err) {
      res.status(500);
      res.end(JSON.stringify({ success: false, message: err.message }));
    }
  }
});

router.get("/restaurantbyid", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var restaurantId = req.query.restaurantId;
    if (restaurantId != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("restaurantId", sql.Int, restaurantId)
          .query(
            "Select Name, Address, Phone, Lat, Lng, UserOwner, Image, PaymentUrl From Restaurant Where id = @restaurantId"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      res.end(
        JSON.stringify({
          success: false,
          message: "Missing restaurant in query",
        })
      );
    }
  }
});

router.get("/nearbyrestaurant", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var userLat = parseFloat(req.query.lat);
    var userLng = parseFloat(req.query.lng);
    var distance = parseFloat(req.query.distance);
    if (userLat != Number.NaN && userLng != Number.NaN) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("lat", sql.Float, userLat)
          .input("lng", sql.Float, userLng)
          .input("distance", sql.Int, distance)
          .query(
            "Select * From(Select Id, Name, Address, Phone, Lat, Lng, UserOwner, Image, PaymentUrl, " +
              " Round(111.04* Degrees(Acos(Cos(Radians(@lat)) * Cos(Radians(lat)) " +
              " * Cos(Radians(lng) - Radians(@lng)) + Sin(Radians(@lat))" +
              " * Sin(Radians(lat)))), 2) as distance From Restaurant) tmp Where " +
              " distance < @distance "
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      res.end(
        JSON.stringify({
          success: false,
          message: "Missing lat or lng in query",
        })
      );
    }
  }
});
/*
 *End: Restaurant table: POST, GET
 */
// ---------------------------------------------------
/*
 *Begin: Menu table: POST, GET
 */
router.get("/menu", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var restaurantId = req.query.restaurantId;
    if (restaurantId != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("restaurantId", sql.Int, restaurantId)
          .query(
            "Select t.Id, t.Name, t.Description, t.Image From Menu t Where t.Id In " +
              " (Select t1.MenuId From Restaurant_Menu t1 Where t1.RestaurantId = @restaurantId )"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing RestaurantId in query",
      });
    }
  }
});

/*
 *End: Menu table: POST, GET
 */
// ---------------------------------------------------
/*
 *Begin: Food table: POST, GET
 */
router.get("/food", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var menuId = req.query.menuId;
    if (menuId != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("menuId", sql.Int, menuId)
          .query(
            "Select Id, Name, Description, Image, Price, IsSize, IsAddon, Discount From Food Where Id In " +
              " (Select FoodId From Menu_Food Where MenuId = @menuId)"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing MenuId in query",
      });
    }
  }
});

router.get("/foodbyid", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var foodId = req.query.foodId;
    if (foodId != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("foodId", sql.Int, foodId)
          .query(
            "Select Id, Name, Description, Image, Price, IsSize, IsAddon, Discount From Food Where Id = @foodId "
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing FoodId in query",
      });
    }
  }
});

router.get("/searchfood", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var searchQuery = req.query.foodName;
    if (searchQuery != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("searchQuery", sql.NVarChar, "%" + searchQuery + "%")
          .query(
            "Select Id, Name, Description, Image, Price, IsSize, IsAddon, Discount From Food Where Name Like @searchQuery "
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing Food Name in query",
      });
    }
  }
});

/*
 *End: Food table: POST, GET
 */

// ---------------------------------------------------
/*
 *Begin: Size table: POST, GET
 */

router.get("/size", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var foodId = req.query.foodId;
    if (foodId != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("foodId", sql.Int, foodId)
          .query(
            "Select Id, Description, ExtraPrice From Size Where Id In " +
              " (Select SizeId From Food_Size Where FoodId = @foodId)"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing foodId in query",
      });
    }
  }
});
/*
 *End: Size table: POST, GET
 */

// ---------------------------------------------------
/*
 *Begin: addon table: POST, GET
 */
router.get("/addon", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var foodId = req.query.foodId;
    if (foodId != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("foodId", sql.Int, foodId)
          .query(
            "Select Id, Name, Description, ExtraPrice From Addon Where Id In " +
              " (Select AddonId From Food_Addon Where FoodId = @foodId)"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing foodId in query",
      });
    }
  }
});

/*
 *End: addon table: POST, GET
 */

// ---------------------------------------------------
// ORDER
router.get("/order", async (req, res, next) => {
  console.log(req.query);
  if (req.query.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var orderFbid = req.query.orderFbid;
    if (orderFbid != null) {
      try {
        const pool = await poolPromise;
        const queryResult = await pool
          .request()
          .input("orderFbid", sql.NVarChar, orderFbid)
          .query(
            "Select OrderFBID, OrderPhone, OrderName, OrderAddress, OrderStatus, " +
              " OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem From [Order] " +
              " Where OrderFBID = @orderFbid"
          );
        if (queryResult.recordset.length > 0) {
          res.end(
            JSON.stringify({ success: true, result: queryResult.recordset })
          );
        } else {
          res.end(JSON.stringify({ success: false, message: "Empty" }));
        }
      } catch (err) {
        res.status(500);
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    } else {
      JSON.stringify({
        success: false,
        message: "Missing orderFbid in query",
      });
    }
  }
});

router.post("/createOrder", async (req, res, next) => {
  console.log(req.body);
  if (req.body.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var order_phone = req.body.orderPhone;
    var order_name = req.body.orderName;
    var order_address = req.body.orderAddress;
    var order_date = req.body.orderDate;
    var restaurantId = req.body.restaurantId;
    var transactionId = req.body.transactionId;
    var cod = req.body.cod;
    var totalPrice = req.body.totalPrice;
    var numOfItem = req.body.numOfItem;
    var orderFbid = req.body.orderFbid;
  }
  if (orderFbid != null) {
    try {
      const pool = await poolPromise;
      const queryResult = await pool
        .request()
        .input("orderPhone", sql.NVarChar, order_phone)
        .input("orderName", sql.NVarChar, order_name)
        .input("orderAddress", sql.NVarChar, order_address)
        .input("orderDate", sql.Date, order_date)
        .input("restaurantId", sql.Int, restaurantId)
        .input("transactionId", sql.NVarChar, transactionId)
        .input("cod", sql.Bit, cod == true ? 1 : 0)
        .input("totalPrice", sql.Float, totalPrice)
        .input("numOfItem", sql.Int, numOfItem)
        .input("orderFbid", sql.NVarChar, orderFbid)
        .query(
          " Insert Into [Order](OrderFBID, OrderPhone, OrderName, OrderAddress, OrderStatus, " +
            " OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem) " +
            " Values(@orderFbid, @orderPhone, @orderName, @orderAddress, 0, @orderDate, " +
            " @restaurantId, @transactionId, @cod, @totalPrice, @numOfItem)" +
            " Select TOP 1 OrderId as OrderNumber From [Order] Where OrderFBID = @orderFbid" +
            " Order By OrderNumber Desc "
        );

      if (queryResult.recordset.length > 0) {
        res.end(
          JSON.stringify({ success: true, result: queryResult.recordset })
        );
      } else {
        res.end(JSON.stringify({ success: false, message: "Empty" }));
      }
    } catch (err) {
      res.status(500);
      res.end(JSON.stringify({ success: false, message: err.message }));
    }
  } else {
    res.end(
      JSON.stringify({
        success: false,
        message: "Missing fqid in body of POST request",
      })
    );
  }
});

// router.get("/orderDetail", async (req, res, next) => {
//   console.log(req.query);
//   if (req.query.key != API_KEY) {
//     res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
//   } else {
//     var orderId = req.query.orderId;
//     if (orderId != null) {
//       try {
//         const pool = await poolPromise;
//         const queryResult = await pool
//           .request()
//           .input("orderId", sql.Int, orderId)
//           .query(
//             "Select ItemId, Quantity, Price, Discount, Size, Addon, " +
//               " ExtraPrice From OrderDetail Where OrderId = @orderId"
//           );
//         if (queryResult.recordset.length > 0) {
//           res.end(
//             JSON.stringify({ success: true, result: queryResult.recordset })
//           );
//         } else {
//           res.end(JSON.stringify({ success: false, message: "Empty" }));
//         }
//       } catch (err) {
//         res.status(500);
//         res.end(JSON.stringify({ success: false, message: err.message }));
//       }
//     } else {
//       JSON.stringify({
//         success: false,
//         message: "Missing orderFbid in query",
//       });
//     }
//   }
// });

router.post("/updateOrder", async (req, res, next) => {
  console.log(req.body);
  if (req.body.key != API_KEY) {
    res.end(JSON.stringify({ success: false, message: "Wrong API Key" }));
  } else {
    var order_id = req.body.orderId;
    var order_detail;

    // try {
    //   order_detail = JSON.parse(JSON.stringify(req.body.orderDetails));
    // } catch (err) {
    //   res.status(500);
    //   res.send(JSON.stringify({ success: false, message: err.message }));
    // }
  }
  if (order_id != null) {
    try {
      const pool = await poolPromise;
      const table = new sql.Table('Size');
      table.create = true;
      table.columns.add("Id", sql.Int, { nullable: false, primary: true });
      table.columns.add("Description", sql.NVarChar, { nullable: true});
      table.columns.add("ExtraPrice", sql.Int, { nullable: true});
      // table.columns.add("Quantity", sql.Int, { nullable: true });
      // table.columns.add("Price", sql.Float, { nullable: true });
      // table.columns.add("Discount", sql.Int, { nullable: true });
      // table.columns.add("Size", sql.NVarChar(50), { nullable: true });
      // table.columns.add("Addon", sql.NVarChar(4000), { nullable: true });
      // table.columns.add("ExtraPrice", sql.Float, { nullable: true });

      // for (i = 0; i < order_detail.length; i++) {
      //   table.rows.add(
      //     order_id,
      //     order_detail[i]["foodId"],
      //     order_detail[i]["foodQuantity"],
      //     order_detail[i]["foodPrice"],
      //     order_detail[i]["foodDiscount"],
      //     order_detail[i]["foodSize"],
      //     order_detail[i]["foodAddon"],
      //     parseFloat(order_detail[i]["foodExtraPrice"])
      //   );
      // }

      //values.forEach(arr => table.rows.add.apply(null, arr));
      table.rows.add(4, "LonNhat", 5);
      const request = pool.request();
      request.bulk(table, (err, result) => {
        if (err) {
          console.log(err);
          res.send(JSON.stringify({ success: false, message: err.message }));
        } else {
          res.send(
            JSON.stringify({ success: true, message: "Update Success" })
          );
        }
      });
      // const request = pool.request();
      // const results = await request.bulk(table);
      // console.log(`rows affected ${results.rowsAffected}`);
      // request.bulk(table, (err, resultBulk) => {
      //   if (err) {
      //     console.log(err);
      //     res.send(JSON.stringify({ success: false, message: err.message }));
      //   } else {
      //     res.send(
      //       JSON.stringify({ success: true, message: "Update Success" })
      //     );
      //   }
      // });
    } catch (err) {
      res.status(500);
      res.end(JSON.stringify({ success: false, message: err.message }));
    }
  } else {
    res.end(
      JSON.stringify({
        success: false,
        message: "Missing order_id of POST request",
      })
    );
  }
});
// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------

module.exports = router;