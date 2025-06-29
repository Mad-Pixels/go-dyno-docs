activeUsers, err := userprofiles.NewScanBuilder().
	FilterEQ("is_active", true).
	FilterBetween("age", 18, 65).
	Execute(ctx, client)