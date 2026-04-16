<script setup lang="ts">
import { ref } from 'vue'
import OSWindow from '~/components/os/OSWindow.vue'

interface Order {
  id: number
  isOpen: boolean
  isMinimized: boolean
  items: string[]
  windowRef?: any
}

const activeOrders = ref<Order[]>([])
let nextOrderId = 1

function startOrder() {
  activeOrders.value.push({
    id: nextOrderId++,
    isOpen: true,
    isMinimized: false,
    items: []
  })
}

function handleOrderClose(id: number) {
  // If the user clicks 'X', we discard the draft completely
  activeOrders.value = activeOrders.value.filter(o => o.id !== id)
}

function finishOrder(id: number) {
  // Checkout logic...
  handleOrderClose(id)
}

function focusOrderWindow(order: Order) {
  if (order.windowRef) {
    order.windowRef.bringToFront()
  }
}
</script>

<template>
  <div class="pos-app p-4 h-full bg-slate-100 dark:bg-slate-800 flex flex-col gap-4">
    <header class="flex justify-between items-center">
      <h1 class="text-xl font-bold dark:text-white">Point of Sale (POS)</h1>
      <button 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md shadow-blue-500/20"
        @click="startOrder"
      >
        <span class="icon-[mdi--plus] mr-1 align-sub"></span> Take Order
      </button>
    </header>
    
    <div class="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow p-4 overflow-y-auto">
      <p v-if="activeOrders.length === 0" class="text-slate-500 italic text-center mt-10">No active orders right now. Waiting for customers...</p>
      <div v-else class="grid grid-cols-2 gap-4">
        <div v-for="order in activeOrders" :key="order.id" class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 relative">
            <h3 class="font-bold text-lg dark:text-slate-200">Order #{{ order.id }}</h3>
            <p class="text-sm" :class="order.isOpen ? 'text-amber-500' : 'text-slate-500'">Status: {{ order.isOpen ? (order.isMinimized ? 'Minimized in Taskbar' : 'Active Window') : 'Hidden (Draft)' }}</p>
            <button 
              class="mt-2 text-sm bg-slate-200 dark:bg-slate-700 dark:text-white px-3 py-1 rounded transition hover:bg-slate-300 dark:hover:bg-slate-600"
              @click="focusOrderWindow(order)"
            >
              {{ order.isMinimized ? 'Restore Window' : 'Bring to Front' }}
            </button>
        </div>
      </div>
    </div>

    <!-- The OSWindow component iterates through our local array and spawns pure OS Modals! -->
    <!-- It supports full taskbar grouping and restore natively through the show-in-taskbar prop -->
    <OSWindow 
      v-for="order in activeOrders" 
      :ref="(el) => { if (el) order.windowRef = el }"
      :key="order.id"
      v-model="order.isOpen"
      v-model:minimized="order.isMinimized"
      :minimize-with-parent="true"
      :title="`Order Checkout #${order.id}`"
      icon-class="icon-[carbon--shopping-cart-arrow-down]"
      :show-in-taskbar="true"
      :width="400"
      :height="500"
      @closed="handleOrderClose(order.id)"
    >
      <div class="h-full bg-white dark:bg-slate-800 p-6 flex flex-col gap-6">
        <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600 dark:text-blue-400">
               <span class="icon-[carbon--pos] text-3xl"></span>
            </div>
            <h2 class="text-xl font-bold dark:text-white">Active Order #{{ order.id }}</h2>
        </div>
        
        <div class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-4 text-center text-slate-500 italic flex items-center justify-center">
           Scan items to add...
        </div>

        <button 
          class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          @click="finishOrder(order.id)"
        >
          <span class="icon-[mdi--check-circle]"></span> Mark Paid & Close
        </button>
      </div>
    </OSWindow>
  </div>
</template>
