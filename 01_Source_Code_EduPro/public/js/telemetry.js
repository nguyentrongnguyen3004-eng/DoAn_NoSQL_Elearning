// ==============================================================================
// 4. TELEMETRY ENGINE: 4-NOSQL LIVE MONITOR, REDIS FIREWALL & DISASTER RECOVERY
// ==============================================================================

    // TÍNH NĂNG KIẾN TRÚC 2: GIÁM SÁT HIỆU NĂNG 4 CSDL, TƯỜNG LỬA & PHỤC HỒI THẢM HỌA
    // ==============================================================================
    function openSystemTelemetryModal() {
      // KIỂM TRA PHÂN QUYỀN (RBAC): CHỈ CÓ QUẢN TRỊ VIÊN (ADMIN) MỚI ĐƯỢC PHÉP TRUY CẬP
      if (!currentUser || !currentToken || currentUser.role !== 'ADMIN') {
        if (typeof showCustomAlert === 'function') {
          showCustomAlert('⛔ Quyền truy cập bị từ chối: Bảng điều khiển cấu hình & giám sát 4 CSDL NoSQL chỉ dành riêng cho Quản trị viên (Admin).');
        } else if (typeof showToast === 'function') {
          showToast('⛔ Chỉ Quản trị viên (Admin) mới có quyền truy cập cấu hình 4 CSDL!', 'error');
        } else {
          alert('⛔ Chỉ Quản trị viên (Admin) mới có quyền truy cập cấu hình 4 CSDL!');
        }
        return;
      }

      document.getElementById('modal-system-telemetry')?.classList.remove('hidden');
      switchTelemetryTab('metrics');
      loadLiveTelemetryMetrics();
    }

    function closeSystemTelemetryModal() {
      document.getElementById('modal-system-telemetry')?.classList.add('hidden');
    }

    function getTelemetryAuthHeaders(customHeaders = {}) {
      const headers = { ...customHeaders };
      if (typeof currentToken !== 'undefined' && currentToken) {
        headers['Authorization'] = 'Bearer ' + currentToken;
      }
      return headers;
    }

    function switchTelemetryTab(tab) {
      const pMetrics = document.getElementById('panel-telem-metrics');
      const pFirewall = document.getElementById('panel-telem-firewall');
      const pBackups = document.getElementById('panel-telem-backups');

      const bMetrics = document.getElementById('btn-tab-telem-metrics');
      const bFirewall = document.getElementById('btn-tab-telem-firewall');
      const bBackups = document.getElementById('btn-tab-telem-backups');

      [pMetrics, pFirewall, pBackups].forEach(p => p?.classList.add('hidden'));
      [bMetrics, bFirewall, bBackups].forEach(b => {
        b?.classList.remove('bg-brand-50', 'dark:bg-brand-950', 'text-brand-600', 'dark:text-indigo-400', 'border', 'border-brand-200');
        b?.classList.add('text-slate-600', 'dark:text-slate-400');
      });

      if (tab === 'metrics') {
        pMetrics?.classList.remove('hidden');
        bMetrics?.classList.add('bg-brand-50', 'dark:bg-brand-950', 'text-brand-600', 'dark:text-indigo-400', 'border', 'border-brand-200');
        loadLiveTelemetryMetrics();
      } else if (tab === 'firewall') {
        pFirewall?.classList.remove('hidden');
        bFirewall?.classList.add('bg-brand-50', 'dark:bg-brand-950', 'text-brand-600', 'dark:text-indigo-400', 'border', 'border-brand-200');
        loadFirewallStatus();
      } else if (tab === 'backups') {
        pBackups?.classList.remove('hidden');
        bBackups?.classList.add('bg-brand-50', 'dark:bg-brand-950', 'text-brand-600', 'dark:text-indigo-400', 'border', 'border-brand-200');
        loadBackupsList();
      }
    }

    async function loadLiveTelemetryMetrics() {
      try {
        const res = await fetch('/api/telemetry/live-metrics', {
          headers: getTelemetryAuthHeaders()
        });
        const data = await res.json();
        if (data.success && data.data) {
          const m = data.data;
          document.getElementById('metric-mongo-docs').textContent = (m.mongodb.totalDocs || 79) + ' docs';
          document.getElementById('metric-mongo-cols').textContent = m.mongodb.collectionsCount || 5;
          document.getElementById('metric-mongo-lat').textContent = (m.mongodb.latencyMs || 2) + 'ms';

          document.getElementById('metric-redis-ram').textContent = m.redis.usedMemory || '1.8 MB';
          document.getElementById('metric-redis-keys').textContent = m.redis.totalKeys || 18;
          document.getElementById('metric-redis-channels').textContent = (m.redis.pubSubChannels || 3) + ' channels';

          document.getElementById('metric-cas-events').textContent = (m.cassandra.totalEvents || 24) + ' events';

          document.getElementById('metric-neo-nodes').textContent = (m.neo4j.nodesCount || 23) + ' Nodes';
          document.getElementById('metric-neo-edges').textContent = m.neo4j.edgesCount || 25;
          document.getElementById('metric-neo-lat').textContent = (m.neo4j.cypherLatencyMs || 3) + 'ms';

          document.getElementById('metric-node-ram').textContent = (m.system.nodeMemoryMb || 80) + ' MB';
          const upH = Math.floor((m.system.uptimeSeconds || 600) / 3600);
          const upM = Math.floor(((m.system.uptimeSeconds || 600) % 3600) / 60);
          document.getElementById('metric-node-uptime').textContent = `${upH}h ${upM}m`;
        }
      } catch (e) {
        console.warn('Loi khi load telemetry metrics:', e);
      }
    }

    async function loadFirewallStatus() {
      const blContainer = document.getElementById('firewall-blacklist-container');
      const auditContainer = document.getElementById('firewall-audit-logs');

      try {
        const res = await fetch('/api/telemetry/security/firewall', {
          headers: getTelemetryAuthHeaders()
        });
        const data = await res.json();
        if (data.success && data.firewall) {
          if (blContainer) {
            blContainer.innerHTML = data.firewall.blacklistedIps.map(ip => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-ban text-rose-500"></i>
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${ip}</span>
                </div>
                <button onclick="unblockFirewallIp('${ip}')" class="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 font-bold text-[11px] text-slate-700 dark:text-slate-300 transition-all">
                  Gỡ Chặn (Unblock)
                </button>
              </div>
            `).join('');
          }

          if (auditContainer) {
            auditContainer.innerHTML = data.firewall.auditLogs.map(l => `
              <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span class="text-slate-400">${new Date(l.time).toLocaleTimeString('vi-VN')}</span>
                <span class="${l.status === 'ALLOW' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}">[${l.status}] ${l.event}</span>
                <span class="text-slate-500">${l.user} (${l.ip})</span>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        console.warn('Loi load firewall:', e);
      }
    }

    async function unblockFirewallIp(ip) {
      try {
        const res = await fetch('/api/telemetry/security/unblock', {
          method: 'POST',
          headers: getTelemetryAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ip })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          loadFirewallStatus();
        }
      } catch (e) {
        showToast('Lỗi gỡ chặn IP: ' + e.message, 'error');
      }
    }

    async function loadBackupsList() {
      const container = document.getElementById('backups-list-container');
      if (!container) return;

      try {
        const res = await fetch('/api/backups', {
          headers: getTelemetryAuthHeaders()
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.length === 0) {
            container.innerHTML = '<div class="text-center py-6 text-slate-400">Chưa có bản sao lưu nào. Hãy bấm nút tạo bản sao lưu ở trên.</div>';
            return;
          }
          container.innerHTML = data.data.map(b => `
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div>
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i class="fa-solid fa-box-archive text-amber-500"></i>
                  <span>${b.backupId}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">4 CSDL SYNC</span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Thời gian: ${new Date(b.createdAt).toLocaleString('vi-VN')} • Dung lượng: <b>${b.sizeMb} MB</b>
                </div>
              </div>
              <button onclick="restoreDisasterBackup('${b.folderName}')" class="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-amber-500 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>Phục Hồi Thảm Họa (Restore)</span>
              </button>
            </div>
          `).join('');
        }
      } catch (e) {
        console.warn('Loi load backups:', e);
      }
    }

    async function createDisasterBackup() {
      const btn = document.getElementById('btn-create-backup');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang tạo Snapshot 4 CSDL...';
      }

      try {
        const res = await fetch('/api/backups/create', {
          method: 'POST',
          headers: getTelemetryAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ operator: currentUser?.fullName || 'Admin Architect' })
        });
        const data = await res.json();
        if (data.success) {
          showToast('🎉 Đã tạo thành công bản sao lưu đồng bộ 4 CSDL NoSQL!', 'success');
          loadBackupsList();
        } else {
          showToast(data.message || 'Lỗi tạo sao lưu.', 'error');
        }
      } catch (e) {
        showToast('Lỗi tạo sao lưu: ' + e.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-plus"></i> <span>Tạo Bản Sao Lưu 4 CSDL Ngay</span>';
        }
      }
    }

    async function restoreDisasterBackup(folder) {
      if (!confirm(`Bạn có chắc chắn muốn thực hiện Phục Hồi Thảm Họa (Disaster Recovery) từ bản sao lưu [${folder}] không?`)) return;

      try {
        showToast('Đang tiến hành phục hồi thảm họa đồng bộ 4 CSDL NoSQL...', 'info');
        const res = await fetch(`/api/backups/${folder}/restore`, {
          method: 'POST',
          headers: getTelemetryAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          loadLiveTelemetryMetrics();
        } else {
          showToast(data.message || 'Lỗi phục hồi.', 'error');
        }
      } catch (e) {
        showToast('Lỗi kết nối phục hồi: ' + e.message, 'error');
      }
    }

    // ==============================================================================
