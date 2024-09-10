function getRunningBalance(public_address, till_id) {
  $.ajax({
    type: "GET",
    url: public_address + "/api/get/tills/cash-total/" + till_id,
    success: function (response) {
      if (response.status == "ok" && response.cashTotal) {
        $("#tillBalanceWrapper").removeClass("d-none");
        $("#tillBalance").html(response.cashTotal);
      }
    },
  });
}
