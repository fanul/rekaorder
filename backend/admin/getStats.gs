/**
 * RekaOrder - Get Order Stats
 * Returns order statistics for dashboard
 */

function getOrderStats() {
  try {
    const orders = getAllOrders({}).orders || [];

    const stats = {
      total: orders.length,
      baru: 0,
      diproses: 0,
      selesai: 0,
      batal: 0,
      totalRevenue: 0
    };

    orders.forEach(order => {
      switch (order.Status) {
        case 'Baru':
          stats.baru++;
          break;
        case 'Dikonfirmasi':
        case 'Diproses':
        case 'Siap':
          stats.diproses++;
          break;
        case 'Selesai':
          stats.selesai++;
          stats.totalRevenue += parseNumber(order.TotalAmount);
          break;
        case 'Batal':
          stats.batal++;
          break;
      }
    });

    return { success: true, stats: stats };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
