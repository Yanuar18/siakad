<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page from class page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->get(route('class', [$team->slug]));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the class page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->get(route('class', [$team->slug]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('student/class')
    );
});
